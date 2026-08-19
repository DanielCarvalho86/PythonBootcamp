import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import CellIsRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter
from datetime import date

OUT = "/home/user/PythonBootcamp/loss-prevention-team-dashboard/equipe-prevencao-de-perdas.xlsx"

NAVY = "2E4374"
NAVY_DARK = "1F3059"
WHITE = "FFFFFF"
GOOD = "1F8A5A"
GOOD_SOFT = "E3F4EC"
WARN = "A86A08"
WARN_SOFT = "FBF0D9"
CRIT = "BD3A30"
CRIT_SOFT = "FBE7E4"
NEUTRAL_SOFT = "EAEDF2"
NEUTRAL = "6B7688"

FONT_NAME = "Arial"

wb = openpyxl.Workbook()

# ---------------------------------------------------------------------------
# Sheet 1: Colaboradores
# ---------------------------------------------------------------------------
ws = wb.active
ws.title = "Colaboradores"

headers = [
    "Matrícula", "Nome Completo", "Cargo", "Função", "Unidade / Local de Trabalho",
    "Gestor Direto", "Telefone", "Emergência - Nome", "Emergência - Parentesco",
    "Emergência - Telefone", "Data de Admissão", "Status",
    "CNH - Número", "CNH - Categoria", "CNH - Validade", "CNH - Situação",
    "ASO - Validade", "ASO - Situação",
    "Treinamento / Reciclagem", "Treinamento - Validade", "Treinamento - Situação",
    "Antecedentes / Certidão - Validade", "Antecedentes - Situação",
    "Situação Geral dos Documentos",
    "Período Aquisitivo - Início", "Período Aquisitivo - Fim",
    "Dias de Direito", "Dias Já Gozados", "Saldo de Dias",
    "Próximas Férias - Início", "Próximas Férias - Fim",
    "Prazo Legal de Concessão", "Situação das Férias",
    "Notebook", "Celular Corporativo", "Monitor", "Mouse", "Teclado", "Veículo",
    "Crachá de Acesso", "Rádio / HT", "Uniforme / Colete",
    "Identificação / Patrimônio", "Outros Equipamentos",
    "Pendência Aberta", "Descrição da Pendência", "Observações Gerais",
]
assert len(headers) == 47

for col, title in enumerate(headers, start=1):
    c = ws.cell(row=1, column=col, value=title)
    c.font = Font(name=FONT_NAME, bold=True, color=WHITE, size=10)
    c.fill = PatternFill("solid", fgColor=NAVY)
    c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="left")
ws.row_dimensions[1].height = 34
ws.freeze_panes = "C2"
ws.auto_filter.ref = f"A1:AU1"

# column-letter shortcuts (1-indexed positions from `headers`)
COL = {name: i + 1 for i, name in enumerate([
    "matricula", "nome", "cargo", "funcao", "unidade", "gestor", "telefone",
    "emerg_nome", "emerg_parentesco", "emerg_telefone", "admissao", "status",
    "cnh_num", "cnh_cat", "cnh_val", "cnh_sit",
    "aso_val", "aso_sit",
    "trein_nome", "trein_val", "trein_sit",
    "antec_val", "antec_sit",
    "doc_geral",
    "periodo_ini", "periodo_fim",
    "dias_direito", "dias_gozados", "saldo",
    "ferias_prox_ini", "ferias_prox_fim",
    "prazo_limite", "ferias_sit",
    "eq_notebook", "eq_celular", "eq_monitor", "eq_mouse", "eq_teclado", "eq_veiculo",
    "eq_cracha", "eq_radio", "eq_colete",
    "eq_patrimonio", "eq_outros",
    "pend_flag", "pend_desc", "obs",
])}


def L(name):
    return get_column_letter(COL[name])


# --- sample data (mirrors the interactive dashboard) --------------------------------
rows = [
    dict(
        matricula="PP-1001", nome="Marina Salgado Ferreira", cargo="Gerente de Prevenção de Perdas",
        funcao="Gestão Regional", unidade="Regional Sudeste",
        gestor="Ricardo Nogueira (Diretor de Operações)", telefone="(11) 98211-4470",
        emerg_nome="Beatriz Salgado", emerg_parentesco="Cônjuge", emerg_telefone="(11) 98811-2290",
        admissao=date(2019, 3, 11), status="Ativo",
        cnh_num="34781122-SP", cnh_cat="B", cnh_val=date(2027, 5, 2),
        aso_val=date(2026, 9, 5),
        trein_nome="Gestão de Crise e Compliance", trein_val=date(2026, 12, 1),
        antec_val=date(2027, 1, 15),
        periodo_ini=date(2025, 3, 11), periodo_fim=date(2026, 3, 10),
        dias_direito=30, dias_gozados=10,
        ferias_prox_ini=None, ferias_prox_fim=None,
        eq=dict(notebook="Sim", celular="Sim", monitor="Sim", mouse="Sim", teclado="Sim",
                veiculo="Sim", cracha="Sim", radio="Não", colete="Não"),
        eq_patrimonio="NB-1188 · Cel 11 98211-4470 · Placa RKA-1B32", eq_outros="",
        pend_flag="Não", pend_desc="", obs="",
    ),
    dict(
        matricula="PP-1014", nome="Eduardo Matias Costa", cargo="Supervisor de Prevenção de Perdas",
        funcao="Supervisão de Loja", unidade="Loja Centro",
        gestor="Marina Salgado Ferreira", telefone="(11) 97744-1182",
        emerg_nome="Paula Matias", emerg_parentesco="Irmã", emerg_telefone="(11) 97744-9090",
        admissao=date(2021, 6, 1), status="Ativo",
        cnh_num="41982233-SP", cnh_cat="B", cnh_val=date(2026, 8, 25),
        aso_val=date(2027, 1, 10),
        trein_nome="Abordagem e Direito de Prisão em Flagrante", trein_val=date(2026, 9, 1),
        antec_val=date(2026, 8, 20),
        periodo_ini=date(2024, 6, 1), periodo_fim=date(2025, 5, 31),
        dias_direito=30, dias_gozados=0,
        ferias_prox_ini=None, ferias_prox_fim=None,
        eq=dict(notebook="Sim", celular="Sim", monitor="Não", mouse="Sim", teclado="Sim",
                veiculo="Não", cracha="Sim", radio="Sim", colete="Não"),
        eq_patrimonio="NB-2077 · Cel 11 97744-1182 · HT-014", eq_outros="",
        pend_flag="Sim", pend_desc="Aguardando devolução de rádio HT antigo (HT-009)",
        obs="Prazo de concessão de férias do ciclo 2024/2025 já venceu — priorizar agendamento imediato.",
    ),
    dict(
        matricula="PP-1022", nome="Juliana Prates Andrade", cargo="Analista de Prevenção de Perdas",
        funcao="Monitoramento CFTV & Auditoria", unidade="Loja Centro",
        gestor="Eduardo Matias Costa", telefone="(11) 96633-5510",
        emerg_nome="Renato Prates", emerg_parentesco="Pai", emerg_telefone="(11) 96633-0021",
        admissao=date(2022, 2, 14), status="Ativo",
        cnh_num="", cnh_cat="", cnh_val=None,
        aso_val=date(2026, 10, 30),
        trein_nome="Auditoria de Estoque e Análise de Perdas", trein_val=date(2027, 2, 20),
        antec_val=date(2026, 9, 15),
        periodo_ini=date(2025, 2, 14), periodo_fim=date(2026, 2, 13),
        dias_direito=30, dias_gozados=30,
        ferias_prox_ini=date(2027, 1, 5), ferias_prox_fim=date(2027, 2, 3),
        eq=dict(notebook="Sim", celular="Não", monitor="Sim", mouse="Sim", teclado="Sim",
                veiculo="Não", cracha="Sim", radio="Não", colete="Não"),
        eq_patrimonio="NB-1450 · Monitor MN-330", eq_outros="",
        pend_flag="Não", pend_desc="", obs="",
    ),
    dict(
        matricula="PP-1031", nome="Bruno Tavares Lima", cargo="Agente de Prevenção de Perdas",
        funcao="Abordagem e Segurança de Loja", unidade="Loja Norte",
        gestor="Eduardo Matias Costa", telefone="(11) 95522-8871",
        emerg_nome="Camila Tavares", emerg_parentesco="Esposa", emerg_telefone="(11) 95522-0033",
        admissao=date(2023, 9, 4), status="Ativo",
        cnh_num="50921144-SP", cnh_cat="AB", cnh_val=date(2028, 3, 10),
        aso_val=date(2026, 8, 22),
        trein_nome="Uso Progressivo da Força e Contenção", trein_val=date(2026, 11, 11),
        antec_val=date(2026, 12, 1),
        periodo_ini=date(2025, 9, 4), periodo_fim=date(2026, 9, 3),
        dias_direito=30, dias_gozados=0,
        ferias_prox_ini=None, ferias_prox_fim=None,
        eq=dict(notebook="Não", celular="Sim", monitor="Não", mouse="Não", teclado="Não",
                veiculo="Não", cracha="Sim", radio="Sim", colete="Sim"),
        eq_patrimonio="HT-021 · Colete C-08", eq_outros="",
        pend_flag="Não", pend_desc="", obs="",
    ),
    dict(
        matricula="PP-1035", nome="Camila Rezende Souza", cargo="Agente de Prevenção de Perdas",
        funcao="Abordagem e Segurança de Loja", unidade="Loja Sul",
        gestor="Eduardo Matias Costa", telefone="(11) 94411-2298",
        emerg_nome="Adriano Rezende", emerg_parentesco="Pai", emerg_telefone="(11) 94411-7765",
        admissao=date(2024, 1, 15), status="Afastado",
        cnh_num="60233111-SP", cnh_cat="B", cnh_val=date(2027, 7, 19),
        aso_val=date(2026, 8, 19),
        trein_nome="Uso Progressivo da Força e Contenção", trein_val=date(2026, 8, 30),
        antec_val=date(2027, 3, 1),
        periodo_ini=date(2024, 1, 15), periodo_fim=date(2025, 1, 14),
        dias_direito=30, dias_gozados=15,
        ferias_prox_ini=date(2026, 9, 10), ferias_prox_fim=date(2026, 10, 9),
        eq=dict(notebook="Não", celular="Não", monitor="Não", mouse="Não", teclado="Não",
                veiculo="Não", cracha="Sim", radio="Não", colete="Não"),
        eq_patrimonio="Crachá suspenso — aguardando retorno", eq_outros="",
        pend_flag="Sim",
        pend_desc="Em licença médica desde 05/08/2026 — revisar retorno e redistribuição de equipamentos",
        obs="Prazo de concessão do ciclo 2024/2025 já venceu; férias futuras já agendadas para 10/09.",
    ),
    dict(
        matricula="PP-1040", nome="Rafael Cordeiro Nunes", cargo="Analista de Inteligência e Investigações",
        funcao="Investigação de Perdas Internas", unidade="Regional Sudeste",
        gestor="Marina Salgado Ferreira", telefone="(11) 93300-6654",
        emerg_nome="Fernanda Cordeiro", emerg_parentesco="Esposa", emerg_telefone="(11) 93300-1123",
        admissao=date(2020, 11, 23), status="Ativo",
        cnh_num="28871199-SP", cnh_cat="B", cnh_val=date(2026, 9, 12),
        aso_val=date(2027, 4, 4),
        trein_nome="Técnicas de Entrevista e Investigação", trein_val=date(2026, 8, 24),
        antec_val=date(2026, 11, 30),
        periodo_ini=date(2025, 11, 23), periodo_fim=date(2026, 11, 22),
        dias_direito=30, dias_gozados=5,
        ferias_prox_ini=date(2026, 12, 7), ferias_prox_fim=date(2027, 1, 5),
        eq=dict(notebook="Sim", celular="Sim", monitor="Sim", mouse="Sim", teclado="Sim",
                veiculo="Sim", cracha="Sim", radio="Não", colete="Não"),
        eq_patrimonio="NB-1876 · Placa QRX-9J41", eq_outros="",
        pend_flag="Não", pend_desc="", obs="",
    ),
]

N_BLANK_TEMPLATE_ROWS = 10
TOTAL_DATA_ROWS = len(rows) + N_BLANK_TEMPLATE_ROWS
FIRST_DATA_ROW = 2
LAST_DATA_ROW = FIRST_DATA_ROW + TOTAL_DATA_ROWS - 1

date_fmt = "dd/mm/yyyy"

for i in range(TOTAL_DATA_ROWS):
    r = FIRST_DATA_ROW + i
    data = rows[i] if i < len(rows) else None

    if data:
        ws.cell(row=r, column=COL["matricula"], value=data["matricula"])
        ws.cell(row=r, column=COL["nome"], value=data["nome"])
        ws.cell(row=r, column=COL["cargo"], value=data["cargo"])
        ws.cell(row=r, column=COL["funcao"], value=data["funcao"])
        ws.cell(row=r, column=COL["unidade"], value=data["unidade"])
        ws.cell(row=r, column=COL["gestor"], value=data["gestor"])
        ws.cell(row=r, column=COL["telefone"], value=data["telefone"])
        ws.cell(row=r, column=COL["emerg_nome"], value=data["emerg_nome"])
        ws.cell(row=r, column=COL["emerg_parentesco"], value=data["emerg_parentesco"])
        ws.cell(row=r, column=COL["emerg_telefone"], value=data["emerg_telefone"])
        c = ws.cell(row=r, column=COL["admissao"], value=data["admissao"]); c.number_format = date_fmt
        ws.cell(row=r, column=COL["status"], value=data["status"])
        ws.cell(row=r, column=COL["cnh_num"], value=data["cnh_num"])
        ws.cell(row=r, column=COL["cnh_cat"], value=data["cnh_cat"])
        c = ws.cell(row=r, column=COL["cnh_val"], value=data["cnh_val"]); c.number_format = date_fmt
        c = ws.cell(row=r, column=COL["aso_val"], value=data["aso_val"]); c.number_format = date_fmt
        ws.cell(row=r, column=COL["trein_nome"], value=data["trein_nome"])
        c = ws.cell(row=r, column=COL["trein_val"], value=data["trein_val"]); c.number_format = date_fmt
        c = ws.cell(row=r, column=COL["antec_val"], value=data["antec_val"]); c.number_format = date_fmt
        c = ws.cell(row=r, column=COL["periodo_ini"], value=data["periodo_ini"]); c.number_format = date_fmt
        c = ws.cell(row=r, column=COL["periodo_fim"], value=data["periodo_fim"]); c.number_format = date_fmt
        ws.cell(row=r, column=COL["dias_direito"], value=data["dias_direito"])
        ws.cell(row=r, column=COL["dias_gozados"], value=data["dias_gozados"])
        c = ws.cell(row=r, column=COL["ferias_prox_ini"], value=data["ferias_prox_ini"]); c.number_format = date_fmt
        c = ws.cell(row=r, column=COL["ferias_prox_fim"], value=data["ferias_prox_fim"]); c.number_format = date_fmt
        eq = data["eq"]
        ws.cell(row=r, column=COL["eq_notebook"], value=eq["notebook"])
        ws.cell(row=r, column=COL["eq_celular"], value=eq["celular"])
        ws.cell(row=r, column=COL["eq_monitor"], value=eq["monitor"])
        ws.cell(row=r, column=COL["eq_mouse"], value=eq["mouse"])
        ws.cell(row=r, column=COL["eq_teclado"], value=eq["teclado"])
        ws.cell(row=r, column=COL["eq_veiculo"], value=eq["veiculo"])
        ws.cell(row=r, column=COL["eq_cracha"], value=eq["cracha"])
        ws.cell(row=r, column=COL["eq_radio"], value=eq["radio"])
        ws.cell(row=r, column=COL["eq_colete"], value=eq["colete"])
        ws.cell(row=r, column=COL["eq_patrimonio"], value=data["eq_patrimonio"])
        ws.cell(row=r, column=COL["eq_outros"], value=data["eq_outros"])
        ws.cell(row=r, column=COL["pend_flag"], value=data["pend_flag"])
        ws.cell(row=r, column=COL["pend_desc"], value=data["pend_desc"])
        ws.cell(row=r, column=COL["obs"], value=data["obs"])
    else:
        # blank template rows still get the date number format so new entries look right
        for key in ("admissao", "cnh_val", "aso_val", "trein_val", "antec_val",
                    "periodo_ini", "periodo_fim", "ferias_prox_ini", "ferias_prox_fim"):
            ws.cell(row=r, column=COL[key]).number_format = date_fmt

    # --- formulas (written on every row, filled or blank template) ---
    ws.cell(row=r, column=COL["cnh_sit"],
            value=f'=IF({L("cnh_val")}{r}="","N/A",IF({L("cnh_val")}{r}-TODAY()<=7,"Crítico",IF({L("cnh_val")}{r}-TODAY()<=30,"Atenção","Em dia")))')
    ws.cell(row=r, column=COL["aso_sit"],
            value=f'=IF({L("aso_val")}{r}="","N/A",IF({L("aso_val")}{r}-TODAY()<=7,"Crítico",IF({L("aso_val")}{r}-TODAY()<=30,"Atenção","Em dia")))')
    ws.cell(row=r, column=COL["trein_sit"],
            value=f'=IF({L("trein_val")}{r}="","N/A",IF({L("trein_val")}{r}-TODAY()<=7,"Crítico",IF({L("trein_val")}{r}-TODAY()<=30,"Atenção","Em dia")))')
    ws.cell(row=r, column=COL["antec_sit"],
            value=f'=IF({L("antec_val")}{r}="","N/A",IF({L("antec_val")}{r}-TODAY()<=7,"Crítico",IF({L("antec_val")}{r}-TODAY()<=30,"Atenção","Em dia")))')

    cnh_s, aso_s, tr_s, an_s = L("cnh_sit") + str(r), L("aso_sit") + str(r), L("trein_sit") + str(r), L("antec_sit") + str(r)
    ws.cell(row=r, column=COL["doc_geral"],
            value=(f'=IF(OR({cnh_s}="Crítico",{aso_s}="Crítico",{tr_s}="Crítico",{an_s}="Crítico"),"Crítico",'
                   f'IF(OR({cnh_s}="Atenção",{aso_s}="Atenção",{tr_s}="Atenção",{an_s}="Atenção"),"Atenção",'
                   f'IF(AND({cnh_s}="N/A",{aso_s}="N/A",{tr_s}="N/A",{an_s}="N/A"),"N/A","Em dia")))'))

    ws.cell(row=r, column=COL["saldo"],
            value=f'=MAX(0,{L("dias_direito")}{r}-{L("dias_gozados")}{r})')
    ws.cell(row=r, column=COL["prazo_limite"],
            value=f'=IF({L("periodo_fim")}{r}="","",EDATE({L("periodo_fim")}{r},11))')
    c = ws.cell(row=r, column=COL["prazo_limite"]); c.number_format = date_fmt
    ws.cell(row=r, column=COL["ferias_sit"],
            value=(f'=IF({L("prazo_limite")}{r}="","N/A",'
                   f'IF({L("prazo_limite")}{r}-TODAY()<0,"Vencido",'
                   f'IF({L("prazo_limite")}{r}-TODAY()<=60,"Atenção","Em dia")))'))

# --- fonts for all data cells ---
for row in ws.iter_rows(min_row=2, max_row=LAST_DATA_ROW, min_col=1, max_col=len(headers)):
    for cell in row:
        if cell.font is None or not cell.font.bold:
            cell.font = Font(name=FONT_NAME, size=10)

# --- column widths ---
widths = {
    "matricula": 10, "nome": 24, "cargo": 26, "funcao": 26, "unidade": 18,
    "gestor": 26, "telefone": 15, "emerg_nome": 18, "emerg_parentesco": 14,
    "emerg_telefone": 15, "admissao": 12, "status": 11,
    "cnh_num": 13, "cnh_cat": 8, "cnh_val": 12, "cnh_sit": 11,
    "aso_val": 12, "aso_sit": 11,
    "trein_nome": 30, "trein_val": 12, "trein_sit": 11,
    "antec_val": 12, "antec_sit": 11,
    "doc_geral": 14,
    "periodo_ini": 12, "periodo_fim": 12,
    "dias_direito": 9, "dias_gozados": 9, "saldo": 8,
    "ferias_prox_ini": 12, "ferias_prox_fim": 12,
    "prazo_limite": 13, "ferias_sit": 11,
    "eq_notebook": 10, "eq_celular": 10, "eq_monitor": 9, "eq_mouse": 8, "eq_teclado": 9,
    "eq_veiculo": 9, "eq_cracha": 9, "eq_radio": 9, "eq_colete": 10,
    "eq_patrimonio": 30, "eq_outros": 22,
    "pend_flag": 10, "pend_desc": 32, "obs": 34,
}
for key, w in widths.items():
    ws.column_dimensions[L(key)].width = w

# --- data validation dropdowns ---
dv_status = DataValidation(type="list", formula1='"Ativo,Afastado,Inativo"', allow_blank=True)
ws.add_data_validation(dv_status)
dv_status.add(f'{L("status")}{FIRST_DATA_ROW}:{L("status")}{LAST_DATA_ROW}')

dv_simnao = DataValidation(type="list", formula1='"Sim,Não"', allow_blank=True)
ws.add_data_validation(dv_simnao)
for key in ("eq_notebook", "eq_celular", "eq_monitor", "eq_mouse", "eq_teclado",
            "eq_veiculo", "eq_cracha", "eq_radio", "eq_colete", "pend_flag"):
    dv_simnao.add(f'{L(key)}{FIRST_DATA_ROW}:{L(key)}{LAST_DATA_ROW}')

# --- conditional formatting on all "situação" columns ---
sit_fills = {
    "Crítico": (CRIT_SOFT, CRIT), "Vencido": (CRIT_SOFT, CRIT),
    "Atenção": (WARN_SOFT, WARN), "Em dia": (GOOD_SOFT, GOOD), "N/A": (NEUTRAL_SOFT, NEUTRAL),
}
sit_cols = ["cnh_sit", "aso_sit", "trein_sit", "antec_sit", "doc_geral", "ferias_sit"]
for key in sit_cols:
    rng = f'{L(key)}{FIRST_DATA_ROW}:{L(key)}{LAST_DATA_ROW}'
    for text, (fill_hex, font_hex) in sit_fills.items():
        ws.conditional_formatting.add(
            rng,
            CellIsRule(operator="equal", formula=[f'"{text}"'],
                       fill=PatternFill("solid", fgColor=fill_hex),
                       font=Font(name=FONT_NAME, size=10, color=font_hex, bold=True)),
        )

ws.sheet_view.showGridLines = False

# ---------------------------------------------------------------------------
# Sheet 2: Legenda
# ---------------------------------------------------------------------------
ws2 = wb.create_sheet("Legenda")
ws2.sheet_view.showGridLines = False
ws2.column_dimensions["A"].width = 34
ws2.column_dimensions["B"].width = 78

title = ws2.cell(row=1, column=1, value="Central Prevenção de Perdas — Legenda")
title.font = Font(name=FONT_NAME, bold=True, size=14, color=NAVY)
ws2.merge_cells("A1:B1")

intro = ws2.cell(row=2, column=1,
                  value="Planilha de apoio ao painel interativo da equipe. Preencha as linhas em branco da aba "
                        "\"Colaboradores\" com os dados reais — as colunas de situação (documentos e férias) "
                        "recalculam sozinhas a partir da data de hoje.")
intro.font = Font(name=FONT_NAME, italic=True, size=10, color="5B6B82")
ws2.merge_cells("A2:B2")
ws2.row_dimensions[2].height = 30
intro.alignment = Alignment(wrap_text=True, vertical="top")

sections = [
    ("Situação dos documentos (CNH, ASO, treinamento, antecedentes)", None),
    ("Em dia", "Validade a mais de 30 dias no futuro."),
    ("Atenção", "Vence em até 30 dias."),
    ("Crítico", "Já venceu ou vence em até 7 dias."),
    ("N/A", "Data de validade não informada (documento não se aplica ao cargo, ex.: CNH de um analista sem função de condução)."),
    ("", ""),
    ("Situação das férias", None),
    ("Prazo legal de concessão", "Fim do período aquisitivo + 11 meses (regra da CLT — passar desse prazo gera pagamento em dobro)."),
    ("Em dia", "Mais de 60 dias até o prazo legal de concessão."),
    ("Atenção", "Prazo legal de concessão a até 60 dias."),
    ("Vencido", "Prazo legal de concessão já passou — priorizar agendamento."),
    ("", ""),
    ("Como preencher", None),
    ("Matrícula", "Use um código sequencial (ex.: PP-1041) — mantenha único por colaborador."),
    ("Datas", "Preencha no formato dd/mm/aaaa; deixe em branco quando não aplicável."),
    ("Equipamentos / Pendência / Status", "Selecione pela lista suspensa da célula."),
    ("Linhas em branco", "As últimas linhas da aba Colaboradores já têm as fórmulas de situação prontas — basta preencher os dados."),
]

r = 4
for label, desc in sections:
    if desc is None and label:
        c = ws2.cell(row=r, column=1, value=label)
        c.font = Font(name=FONT_NAME, bold=True, size=11, color=WHITE)
        c.fill = PatternFill("solid", fgColor=NAVY_DARK)
        ws2.merge_cells(f"A{r}:B{r}")
        r += 1
        continue
    if not label and not desc:
        r += 1
        continue
    lc = ws2.cell(row=r, column=1, value=label)
    lc.font = Font(name=FONT_NAME, bold=True, size=10)
    dc = ws2.cell(row=r, column=2, value=desc)
    dc.font = Font(name=FONT_NAME, size=10)
    dc.alignment = Alignment(wrap_text=True, vertical="top")
    r += 1

wb.save(OUT)
print("saved", OUT)
