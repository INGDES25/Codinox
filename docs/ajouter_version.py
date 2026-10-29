#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Met à jour data/releases.js sans l'éditer à la main.

Ajouter une version :
  python ajouter_version.py version codinox 1.1 --note "Terminal intégré" --note "Corrections" \
      --windows https://github.com/VOUS/DEPOT/releases/download/v1.1/Codinox-Setup-1.1.exe --taille-windows "85 Mo" \
      --linux https://github.com/VOUS/DEPOT/releases/download/v1.1/Codinox-linux-x64.tar.gz
Ajouter une vidéo :
  python ajouter_version.py video --titre "Premiers pas" --produit codinox --duree "6 min" \
      --url https://github.com/VOUS/DEPOT/releases/download/videos/premiers-pas.mp4 --voir https://youtu.be/xxxx
Changer l'adresse du dépôt GitHub :
  python ajouter_version.py depot https://github.com/VOUS/DEPOT
Afficher le contenu :
  python ajouter_version.py liste
La page affiche toujours la version la plus récente en haut ; les autres passent dans l'historique."""
import argparse, datetime, json, os, re, sys

FICHIER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "releases.js")
ENTETE = "window.CODINOX_SITE = "


def lire():
    with open(FICHIER, encoding="utf-8") as f:
        texte = f.read().strip()
    m = re.match(r"^window\.CODINOX_SITE\s*=\s*(\{.*\})\s*;?\s*$", texte, re.S)
    if not m:
        sys.exit("Fichier data/releases.js illisible : il doit commencer par « window.CODINOX_SITE = { ».")
    return json.loads(m.group(1))


def ecrire(data):
    tmp = FICHIER + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        f.write(ENTETE + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
    os.replace(tmp, FICHIER)


def cle_version(v):
    return [int(x) if x.isdigit() else 0 for x in re.split(r"[.\-]", v)]


def cmd_version(a, data):
    prod = data["products"].get(a.produit)
    if prod is None:
        sys.exit("Produit inconnu : %s (choix : %s)" % (a.produit, ", ".join(data["products"])))
    if not re.match(r"^\d+(\.\d+)*$", a.numero):
        sys.exit("Numéro de version invalide : %s (exemple : 1.1 ou 2.0.3)" % a.numero)
    if any(v["version"] == a.numero for v in prod["versions"]):
        sys.exit("La version %s de %s existe déjà." % (a.numero, prod["name"]))
    files = []
    if a.windows:
        files.append({"platform": "windows", "label": "Installateur Windows (64 bits)", "url": a.windows, "size": a.taille_windows or ""})
    if a.linux:
        files.append({"platform": "linux", "label": "Linux (64 bits, archive)", "url": a.linux, "size": a.taille_linux or ""})
    if not files:
        sys.exit("Indique au moins un fichier : --windows URL et/ou --linux URL.")
    prod["versions"].append({"version": a.numero, "date": a.date or datetime.date.today().isoformat(), "notes": a.note or [], "files": files})
    prod["versions"].sort(key=lambda v: cle_version(v["version"]), reverse=True)
    print("Version %s %s ajoutée (%d fichier(s))." % (prod["name"], a.numero, len(files)))


def cmd_video(a, data):
    data.setdefault("videos", []).append({k: v for k, v in {
        "title": a.titre, "product": a.produit, "description": a.description or "", "duration": a.duree or "",
        "date": a.date or datetime.date.today().isoformat(), "size": a.taille or "", "url": a.url or "", "watch": a.voir or ""}.items() if v != ""})
    print("Vidéo « %s » ajoutée." % a.titre)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    v = sub.add_parser("version", help="ajouter une version")
    v.add_argument("produit", choices=["codinox", "cnx"]); v.add_argument("numero")
    v.add_argument("--date", help="AAAA-MM-JJ (par défaut : aujourd'hui)")
    v.add_argument("--note", action="append", help="une ligne de nouveautés (répétable)")
    v.add_argument("--windows"); v.add_argument("--taille-windows"); v.add_argument("--linux"); v.add_argument("--taille-linux")
    w = sub.add_parser("video", help="ajouter une vidéo")
    w.add_argument("--titre", required=True); w.add_argument("--produit", choices=["codinox", "cnx", "general"], default="general")
    w.add_argument("--description"); w.add_argument("--duree"); w.add_argument("--date"); w.add_argument("--taille")
    w.add_argument("--url", help="lien de téléchargement"); w.add_argument("--voir", help="lien pour regarder en ligne (YouTube…)")
    d = sub.add_parser("depot", help="changer l'adresse du dépôt GitHub"); d.add_argument("adresse")
    y = sub.add_parser("chaine", help="changer l'adresse de la chaîne YouTube"); y.add_argument("adresse")
    sub.add_parser("liste", help="afficher les versions et les vidéos")
    a = p.parse_args()
    data = lire()
    if a.cmd == "liste":
        for k, prod in data["products"].items():
            print("%s : %s" % (prod["name"], ", ".join(v["version"] for v in prod["versions"]) or "aucune"))
        print("Vidéos : %d  |  Dépôt : %s" % (len(data.get("videos", [])), data.get("repo")))
        return
    if a.cmd == "version": cmd_version(a, data)
    elif a.cmd == "video": cmd_video(a, data)
    elif a.cmd == "depot":
        if not a.adresse.startswith("https://github.com/"):
            sys.exit("L'adresse doit commencer par https://github.com/")
        data["repo"] = a.adresse.rstrip("/"); print("Dépôt : " + data["repo"])
    elif a.cmd == "chaine":
        if not re.match(r"https://(www\.)?youtube\.com/", a.adresse):
            sys.exit("L'adresse doit commencer par https://www.youtube.com/")
        data["youtube"] = a.adresse.rstrip("/"); print("Chaîne : " + data["youtube"])
    ecrire(data)


if __name__ == "__main__":
    main()
