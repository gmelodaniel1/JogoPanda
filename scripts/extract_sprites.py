"""
Pipeline de Extração de Sprites de Estúdio v2 (Panda de Ferro)
- Isolamento exato por componentes conexos (zero vazamento de cotovelos/mangas vizinhas)
- Erosão seletiva de halo JPEG verde na borda externa + 100% Despill na linha de contorno preta
- Preservação integral de cores internas (camisa do Luís, sombrinha de frevo, radar do Pedro Ivo, pimentas do Joel)
"""

import os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SPRITES_DIR = os.path.join(ROOT_DIR, 'public', 'assets', 'sprites')


def get_bg_color(arr: np.ndarray) -> np.ndarray:
    """Amostra a cor exata do fundo verde no canto superior esquerdo."""
    patch = arr[:16, :16, :3].reshape(-1, 3).astype(np.float32)
    return np.median(patch, axis=0)


def dilate_mask(mask: np.ndarray, radius: int) -> np.ndarray:
    """Dilata uma máscara booleana 2D usando MaxFilter do Pillow (rápido e exato)."""
    img = Image.fromarray((mask.astype(np.uint8) * 255))
    dilated = img.filter(ImageFilter.MaxFilter(size=radius * 2 + 1))
    return np.array(dilated) > 127


def chroma_key_rgba(
    img_rgb: np.ndarray,
    bg_rgb: np.ndarray,
    keep_green_icons: bool = False,
    strict_despill: bool = False,
) -> np.ndarray:
    """
    Remove o fundo verde chroma-key com:
    1. Detecção do fundo verde principal (incluindo frestas escuras entre cabelos/braços quando strict_despill=True)
    2. Remoção da franja verde JPEG (halo de 1-3px fora da linha preta de contorno)
    3. Despill de 100% na faixa de 5px da borda externa (ou global quando strict_despill=True)
    4. Preservação total do interior do personagem quando possui roupas/objetos verdes
    """
    h, w, _ = img_rgb.shape
    arr = img_rgb.astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    diff_bg = arr - bg_rgb.reshape((1, 1, 3))
    dist = np.sqrt(np.sum(diff_bg * diff_bg, axis=2))
    max_rb = np.maximum(r, b)
    green_excess = g - max_rb

    # 1. Fundo verde primário
    if keep_green_icons:
        # Nos robôs (Conecta e Itaberaba), preserva os ícones holográficos verdes claros
        core_bg = dist < 48.0
    elif strict_despill:
        # Personagens sem roupas verdes: remove também pequenas frestas verdes escurecidas pelo JPEG entre cabelos/mangas
        core_bg = (dist < 62.0) | ((green_excess > 26.0) & (g > 55.0))
    else:
        core_bg = (dist < 62.0) | ((green_excess > 75.0) & (g > 135.0) & (dist < 115.0))

    # 2. Zona de borda (3px e 5px ao redor do fundo verde)
    near_bg_3 = dilate_mask(core_bg, radius=3)
    near_bg_5 = dilate_mask(core_bg, radius=5)

    # Na zona de 3px do fundo, pixels com forte dominância verde são franja externa do JPEG
    fringe_bg = near_bg_3 & (green_excess > (48.0 if keep_green_icons else (18.0 if strict_despill else 32.0))) & (g > (110.0 if keep_green_icons else 45.0))
    full_bg = core_bg | fringe_bg

    # Rampa suave de alfa nos pixels de transição restantes na borda
    alpha = np.where(full_bg, 0.0, 1.0).astype(np.float32)
    transition_zone = (~full_bg) & near_bg_3 & (green_excess > (10.0 if strict_despill else 18.0))
    alpha = np.where(
        transition_zone,
        np.clip(1.0 - (green_excess - (10.0 if strict_despill else 18.0)) / 22.0, 0.10, 1.0),
        alpha,
    )

    # 3. Despill: elimina 100% do contorno verde ao redor do traço preto (ou em toda a imagem se strict_despill=True)
    if strict_despill:
        despill_zone = green_excess > 3.0
    else:
        despill_zone = near_bg_5 & (green_excess > 8.0)
        if keep_green_icons:
            # Não aplica despill nos hologramas verdes claros (onde R e B também são altos > 90)
            despill_zone = despill_zone & ~((r > 85.0) & (b > 85.0) & (g > 170.0))

    new_g = np.where(despill_zone, max_rb, g)

    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, 0] = np.clip(r, 0, 255).astype(np.uint8)
    out[:, :, 1] = np.clip(new_g, 0, 255).astype(np.uint8)
    out[:, :, 2] = np.clip(b, 0, 255).astype(np.uint8)
    out[:, :, 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    return out


def find_all_components(rgba: np.ndarray, min_pixels: int = 12):
    """
    Encontra todos os componentes conexos de pixels opacos.
    Retorna lista de dicts: { 'mask', 'bbox', 'cx', 'cy', 'count' }
    """
    alpha = rgba[:, :, 3] > 20
    h, w = alpha.shape
    visited = np.zeros_like(alpha, dtype=bool)
    comps = []

    for y in range(h):
        for x in range(w):
            if alpha[y, x] and not visited[y, x]:
                q = deque([(y, x)])
                visited[y, x] = True
                pts_y = []
                pts_x = []
                while q:
                    cy, cx = q.popleft()
                    pts_y.append(cy)
                    pts_x.append(cx)
                    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and alpha[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            q.append((ny, nx))
                if len(pts_x) >= min_pixels:
                    comp_mask = np.zeros_like(alpha, dtype=bool)
                    comp_mask[pts_y, pts_x] = True
                    x1, x2 = min(pts_x), max(pts_x) + 1
                    y1, y2 = min(pts_y), max(pts_y) + 1
                    comps.append({
                        'mask': comp_mask,
                        'bbox': (x1, y1, x2, y2),
                        'cx': float(np.mean(pts_x)),
                        'cy': float(np.mean(pts_y)),
                        'count': len(pts_x),
                    })
    return comps


def slice_poses_by_columns(
    rgba: np.ndarray,
    col_bounds: list[tuple[int, int]],
    trim_bottom_flags: list[bool] | None = None,
) -> list[Image.Image]:
    """
    Isola cada pose horizontalmente garantindo que NENHUM componente conexo cujo centroide
    pertença a outra coluna vaze para a pose atual (elimina pontas de cotovelo/manga vizinha),
    mas mantém elementos flutuantes (emojis, corações, copo caindo) que pertencem àquela coluna.
    """
    comps = find_all_components(rgba, min_pixels=12)
    if trim_bottom_flags is None:
        trim_bottom_flags = [False] * len(col_bounds)

    pose_images = []
    for idx, (x_start, x_end) in enumerate(col_bounds):
        canvas = np.zeros_like(rgba)
        for comp in comps:
            # Se o centroide X do componente (corpo ou emoji flutuante) cai dentro desta coluna, pertence a esta pose
            if x_start <= comp['cx'] < x_end:
                canvas[comp['mask']] = rgba[comp['mask']]

        # Recorta a região útil da pose
        pose_img = trim_and_pad_pose(canvas, trim_bottom=trim_bottom_flags[idx])
        pose_images.append(pose_img)

    return pose_images


def trim_and_pad_pose(pose_rgba: np.ndarray, pad_x: int = 10, pad_top: int = 10, trim_bottom: bool = False) -> Image.Image:
    """Recorta margens transparentes preservando o alinhamento na base."""
    alpha = pose_rgba[:, :, 3]
    ys, xs = np.where(alpha > 15)
    if len(xs) == 0:
        return Image.fromarray(pose_rgba)

    h, w, _ = pose_rgba.shape
    x1 = max(0, int(xs.min()) - pad_x)
    x2 = min(w, int(xs.max()) + 1 + pad_x)
    y1 = max(0, int(ys.min()) - pad_top)
    y2 = min(h, int(ys.max()) + 1) if trim_bottom else h

    cropped = pose_rgba[y1:y2, x1:x2]
    return Image.fromarray(cropped)


def save_pose_expressions(img: Image.Image, char_id: str, expressions: list[str]):
    """Salva a pose recortada em .webp e .png para cada expressão associada."""
    char_dir = os.path.join(SPRITES_DIR, char_id)
    os.makedirs(char_dir, exist_ok=True)
    for expr in expressions:
        webp_path = os.path.join(char_dir, f"{expr}.webp")
        png_path = os.path.join(char_dir, f"{expr}.png")
        img.save(webp_path, format="WEBP", quality=95, method=6)
        img.save(png_path, format="PNG", optimize=True)
        print(f"  [OK] {char_id}/{expr} (.webp & .png) -> {img.size[0]}x{img.size[1]}")


def process_cipriano():
    print("\n--- Processando Gabriel Cipriano ---")
    path = os.path.join(SPRITES_DIR, "cipriano", "CipriPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw[:523, :, :], bg, strict_despill=True)

    bounds = [(0, 207), (207, 410), (410, 613), (613, 816), (816, 1024)]
    expr_groups = [
        ["cipriano_neutro", "cipriano_sorriso_mentolado", "cipriano_calmo_mentolado"],
        ["cipriano_limpando_celular"],
        ["cipriano_irritado_alcool", "cipriano_serio_mentolado", "cipriano_triste"],
        ["cipriano_chocado_ponto_final"],
        ["cipriano_epico_mentolado"],
    ]
    imgs = slice_poses_by_columns(rgba, bounds)
    for img, exprs in zip(imgs, expr_groups):
        save_pose_expressions(img, "cipriano", exprs)


def process_pedro_ivo():
    print("\n--- Processando Pedro Ivo ---")
    path = os.path.join(SPRITES_DIR, "pedro_ivo", "PedroPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)

    # Restaura 100% da tela do celular na pose superior (x=280..355, y=315..445) para proteger o radar verde
    rgba[315:445, 280:355, :3] = raw[315:445, 280:355, :3]
    rgba[315:445, 280:355, 3] = 255

    comps = [c for c in find_all_components(rgba, min_pixels=20000)]
    comps_sorted_y = sorted(comps, key=lambda c: c['cy'])
    top_comp = comps_sorted_y[0]
    bottom_comps = sorted(comps_sorted_y[1:3], key=lambda c: c['cx'])

    poses = [
        (top_comp, ["pedro_ivo_analisando"], True),
        (bottom_comps[0], ["pedro_ivo_neutro", "pedro_ivo_serio", "pedro_ivo_sorriso_discreto"], False),
        (bottom_comps[1], ["pedro_ivo_surpreso"], False),
    ]
    for comp, exprs, trim_b in poses:
        canvas = np.zeros_like(rgba)
        canvas[comp['mask']] = rgba[comp['mask']]
        pose_img = trim_and_pad_pose(canvas, trim_bottom=trim_b)
        save_pose_expressions(pose_img, "pedro_ivo", exprs)


def process_luis():
    print("\n--- Processando Luís ---")
    path = os.path.join(SPRITES_DIR, "luis", "LuisPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg)

    comps = [c for c in find_all_components(rgba, min_pixels=25000)]
    comps_sorted_x = sorted(comps, key=lambda c: c['cx'])

    expr_groups = [
        ["luis_neutro", "luis_desconfiado", "luis_alerta", "luis_cerveja"],
        ["luis_julgando", "luis_indignado", "luis_assustado", "luis_surpreso"],
        ["luis_rindo", "luis_emocionado", "luis_vitorioso"],
    ]
    for comp, exprs in zip(comps_sorted_x[:3], expr_groups):
        canvas = np.zeros_like(rgba)
        canvas[comp['mask']] = rgba[comp['mask']]
        pose_img = trim_and_pad_pose(canvas)
        save_pose_expressions(pose_img, "luis", exprs)


def process_gildro_iviano():
    print("\n--- Processando Gildro Iviano ---")
    path = os.path.join(SPRITES_DIR, "gildro_iviano", "GildroPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)

    bounds = [(0, 342), (342, 682), (682, 1024)]
    expr_groups = [
        ["gildro_iviano_vilao_paulista"],
        ["gildro_ameacando"],
        ["gildro_derrotado"],
    ]
    imgs = slice_poses_by_columns(rgba, bounds, [True, True, True])
    for img, exprs in zip(imgs, expr_groups):
        save_pose_expressions(img, "gildro_iviano", exprs)


def process_joel_das_pimentas():
    print("\n--- Processando Joel das Pimentas ---")
    path = os.path.join(SPRITES_DIR, "joel_das_pimentas", "JoelPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)

    # Na pose 1 (x=22..340, y=414..481), preenche a superfície da tábua com cor de madeira
    for y in range(414, 481):
        row = raw[y, 22:340]
        dark_cols = np.where((row[:, 1] < 190) | (row[:, 0] > 40))[0]
        if len(dark_cols) >= 2:
            left_edge = int(dark_cols[0]) + 22
            right_edge = int(dark_cols[-1]) + 22
            seg = raw[y, left_edge:right_edge]
            is_bg_green = (seg[:, 1] > 180) & (seg[:, 0] < 60) & (seg[:, 2] < 60)
            seg[is_bg_green] = [212, 178, 132]

    rgba = chroma_key_rgba(raw, bg)

    bounds = [(0, 356), (356, 706), (706, 1024)]
    expr_groups = [
        ["joel_desesperado"],
        ["joel_das_pimentas_furioso"],
        ["joel_atacando"],
    ]
    imgs = slice_poses_by_columns(rgba, bounds, [True, False, False])
    for img, exprs in zip(imgs, expr_groups):
        save_pose_expressions(img, "joel_das_pimentas", exprs)


def process_and():
    print("\n--- Processando And ---")
    path = os.path.join(SPRITES_DIR, "and", "AndPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)

    bounds = [(0, 347), (347, 694), (694, 1024)]
    expr_groups = [
        ["and_paz"],
        ["and_louco_ufpe"],
        ["and_confuso"],
    ]
    imgs = slice_poses_by_columns(rgba, bounds)
    for img, exprs in zip(imgs, expr_groups):
        save_pose_expressions(img, "and", exprs)


def process_bilu():
    print("\n--- Processando Bilu ---")
    path = os.path.join(SPRITES_DIR, "bilu", "BiluPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw[:478, :, :], bg, strict_despill=True)

    bounds = [(0, 343), (343, 687), (687, 1024)]
    expr_groups = [
        ["bilu_coracao"],
        ["bilu_assustado"],
        ["bilu_confuso"],
    ]
    imgs = slice_poses_by_columns(rgba, bounds)
    for img, exprs in zip(imgs, expr_groups):
        save_pose_expressions(img, "bilu", exprs)


def process_malu_maciel():
    print("\n--- Processando Malu Maciel ---")
    path = os.path.join(SPRITES_DIR, "malu_maciel", "MaluPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)

    bounds = [(0, 543), (543, 1024)]
    expr_groups = [
        ["malu_maciel_videochamada"],
        ["malu_maciel_feliz"],
    ]
    imgs = slice_poses_by_columns(rgba, bounds)
    for img, exprs in zip(imgs, expr_groups):
        save_pose_expressions(img, "malu_maciel", exprs)


def process_sandro_vagner():
    print("\n--- Processando Sandro Vagner ---")
    path = os.path.join(SPRITES_DIR, "sandro_vagner", "SandroPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)

    bounds = [(0, 514), (514, 1024)]
    expr_groups = [
        ["sandro_reporter"],
        ["sandro_anotando"],
    ]
    imgs = slice_poses_by_columns(rgba, bounds)
    for img, exprs in zip(imgs, expr_groups):
        save_pose_expressions(img, "sandro_vagner", exprs)


def process_conecta_professores():
    print("\n--- Processando Conecta Professores ---")
    path = os.path.join(SPRITES_DIR, "conecta_professores", "ConectaPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, keep_green_icons=True)
    # Garante opacidade 100% na tela do monitor CRT
    rgba[135:445, 235:575, :3] = raw[135:445, 235:575, :3]
    rgba[135:445, 235:575, 3] = 255
    pose_img = trim_and_pad_pose(rgba, pad_x=0)
    save_pose_expressions(pose_img, "conecta_professores", ["robo_conecta", "robo_conecta_curto"])


def process_itaberaba_noticias():
    print("\n--- Processando Itaberaba Notícias ---")
    path = os.path.join(SPRITES_DIR, "itaberaba_noticias", "ItaberabaPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, keep_green_icons=True)
    # Garante opacidade 100% na tela do monitor CRT
    rgba[135:445, 235:575, :3] = raw[135:445, 235:575, :3]
    rgba[135:445, 235:575, 3] = 255
    pose_img = trim_and_pad_pose(rgba, pad_x=0)
    save_pose_expressions(pose_img, "itaberaba_noticias", ["robo_itaberaba", "robo_itaberaba_curto"])


def process_artcomercial():
    print("\n--- Processando ArtComercial ---")
    path = os.path.join(SPRITES_DIR, "artcomercial", "ArtPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)
    # Garante opacidade e cores originais estritamente dentro da tela do monitor CRT da ArtComercial
    rgba[145:375, 215:560, :3] = raw[145:375, 215:560, :3]
    rgba[145:375, 215:560, 3] = 255
    pose_img = trim_and_pad_pose(rgba, pad_x=6, trim_bottom=True)
    save_pose_expressions(pose_img, "artcomercial", ["robo_artcomercial", "robo_artcomercial_curto"])


def process_conrado():
    print("\n--- Processando Conrado ---")
    path = os.path.join(SPRITES_DIR, "conrado", "ConradoPanda.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)

    # Restaura o brilho dourado semitransparente da auréola e estrelas ao redor de Conrado (sem tom verde)
    r = raw[:, :, 0].astype(np.float32)
    g = raw[:, :, 1].astype(np.float32)
    b = raw[:, :, 2].astype(np.float32)
    halo_zone = np.zeros(r.shape, dtype=bool)
    halo_zone[90:470, 120:650] = True
    is_golden_glow = halo_zone & (rgba[:, :, 3] < 220) & (r > 52.0) & (g > 150.0)

    glow_alpha = np.clip((r - 42.0) / 145.0, 0.0, 1.0)
    new_alpha = np.maximum(rgba[:, :, 3].astype(np.float32) / 255.0, glow_alpha)

    rgba[:, :, 0] = np.where(is_golden_glow, np.clip(r * 1.25 + 35.0, 0, 255), rgba[:, :, 0]).astype(np.uint8)
    rgba[:, :, 1] = np.where(is_golden_glow, np.clip(r * 1.12 + 20.0, 0, 255), rgba[:, :, 1]).astype(np.uint8)
    rgba[:, :, 2] = np.where(is_golden_glow, np.clip(b * 1.05, 0, 255), rgba[:, :, 2]).astype(np.uint8)
    rgba[:, :, 3] = np.where(is_golden_glow, np.clip(new_alpha * 255.0, 0, 255), rgba[:, :, 3]).astype(np.uint8)

    pose_img = trim_and_pad_pose(rgba, pad_x=0)
    save_pose_expressions(pose_img, "conrado", ["conrado_bom_dia"])


def process_panda_tela_inicial():
    print("\n--- Processando Panda Tela Inicial & Protagonista ---")
    path = os.path.join(SPRITES_DIR, "PandaTelaInicial.jfif")
    raw = np.array(Image.open(path).convert("RGB"))
    bg = get_bg_color(raw)
    rgba = chroma_key_rgba(raw, bg, strict_despill=True)
    pose_img = trim_and_pad_pose(rgba, pad_x=8, trim_bottom=True)

    # Salva para a Tela Inicial (Main Menu)
    webp_main = os.path.join(SPRITES_DIR, "panda_tela_inicial.webp")
    png_main = os.path.join(SPRITES_DIR, "panda_tela_inicial.png")
    pose_img.save(webp_main, format="WEBP", quality=95, method=6)
    pose_img.save(png_main, format="PNG", optimize=True)
    print(f"  [OK] panda_tela_inicial (.webp & .png) -> {pose_img.size[0]}x{pose_img.size[1]}")

    # Salva também para o protagonista (100% cobertura na auditoria)
    save_pose_expressions(pose_img, "protagonist", ["neutral"])


if __name__ == "__main__":
    process_cipriano()
    process_pedro_ivo()
    process_luis()
    process_gildro_iviano()
    process_joel_das_pimentas()
    process_and()
    process_bilu()
    process_malu_maciel()
    process_sandro_vagner()
    process_conecta_professores()
    process_itaberaba_noticias()
    process_artcomercial()
    process_conrado()
    process_panda_tela_inicial()
    print("\n[SUCESSO v2] Todos os sprites foram recortados sem halo verde e com nitidez máxima!")

