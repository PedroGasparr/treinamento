import os
import time
import pyautogui
import pyperclip
import subprocess
import re
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext

def encontrar_sumatra():
    # Tenta localizar o Sumatra em locais comuns
    caminhos_possiveis = [
        os.path.expandvars(r"%ProgramFiles%\SumatraPDF\SumatraPDF.exe"),
        os.path.expandvars(r"%LocalAppData%\SumatraPDF\SumatraPDF.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\SumatraPDF\SumatraPDF.exe")
    ]
    for caminho in caminhos_possiveis:
        if os.path.isfile(caminho):
            return caminho
    return None

def abrir_pdf_e_copiar_texto(pdf_path, sumatra_path):
    subprocess.Popen([sumatra_path, pdf_path])
    time.sleep(2.5)
    pyautogui.hotkey('ctrl', 'a')
    time.sleep(0.5)
    pyautogui.hotkey('ctrl', 'c')
    time.sleep(1)
    texto = pyperclip.paste()
    pyautogui.hotkey('alt', 'f4')
    return texto

def extrair_nome_dinamico(texto):
    linhas = texto.splitlines()
    for linha in linhas:
        if linha.strip() != "" and linha.strip().isupper() and len(linha.split()) >= 2:
            return linha.strip()
    return None

def renomear_pdf(caminho_original, novo_nome):
    pasta, nome_antigo = os.path.split(caminho_original)
    novo_nome_limpo = re.sub(r'[\\/:*?"<>|]', '_', novo_nome)
    novo_caminho = os.path.join(pasta, f"{novo_nome_limpo}.pdf")
    contador = 1
    while os.path.exists(novo_caminho):
        novo_caminho = os.path.join(pasta, f"{novo_nome_limpo}_{contador}.pdf")
        contador += 1
    os.rename(caminho_original, novo_caminho)
    return novo_caminho

def processar_pdfs(pasta, log_area):
    sumatra = encontrar_sumatra()
    if not sumatra:
        messagebox.showerror("Erro", "SumatraPDF não encontrado. Instale o SumatraPDF e tente novamente.")
        return

    arquivos_pdf = [f for f in os.listdir(pasta) if f.lower().endswith(".pdf")]

    for nome_pdf in arquivos_pdf:
        caminho_pdf = os.path.join(pasta, nome_pdf)
        log_area.insert(tk.END, f"📄 Processando: {nome_pdf}\n")
        log_area.see(tk.END)
        try:
            texto = abrir_pdf_e_copiar_texto(caminho_pdf, sumatra)
            if texto.strip() == "":
                log_area.insert(tk.END, f"❌ Nenhum texto copiado de: {nome_pdf}\n")
                continue

            nome_encontrado = extrair_nome_dinamico(texto)
            if nome_encontrado:
                novo_caminho = renomear_pdf(caminho_pdf, nome_encontrado)
                log_area.insert(tk.END, f"✅ Renomeado para: {os.path.basename(novo_caminho)}\n")
            else:
                log_area.insert(tk.END, f"⚠️ Nome não encontrado em: {nome_pdf}\n")
        except Exception as e:
            log_area.insert(tk.END, f"❌ Erro: {e}\n")

def selecionar_pasta(entry_path, log_area):
    pasta = filedialog.askdirectory()
    if pasta:
        entry_path.delete(0, tk.END)
        entry_path.insert(0, pasta)
        log_area.delete(1.0, tk.END)
        processar_pdfs(pasta, log_area)

# Interface
root = tk.Tk()
root.title("Renomeador de PDFs")

frame = tk.Frame(root, padx=10, pady=10)
frame.pack()

tk.Label(frame, text="Selecione a pasta com PDFs:").pack()

entry_path = tk.Entry(frame, width=50)
entry_path.pack(side=tk.LEFT, padx=(0, 10))

btn_browse = tk.Button(frame, text="Selecionar", command=lambda: selecionar_pasta(entry_path, log_area))
btn_browse.pack(side=tk.LEFT)

log_area = scrolledtext.ScrolledText(root, width=70, height=20)
log_area.pack(pady=10)

root.mainloop()
