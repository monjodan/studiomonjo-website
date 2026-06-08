# Courrier de Séoul — Spécifications de fabrication

Documents de référence pour la construction des gabarits InDesign.
Trois pièces : **la lettre**, **la carte postale**, **la fiche mémoire**.

> **Note sur les PDF de référence.** Les trois fichiers `courrier-letter.pdf`,
> `courrier-postcard.pdf` et `courrier-fiche.pdf` sont des **rendus de référence**
> à dimensions exactes, à placer dans InDesign sur un calque verrouillé pour caler
> la composition. Les polices réelles n'étant pas installées dans
> l'environnement de génération, ces PDF utilisent des substituts visuels :
> Lora (à la place de Cormorant Garamond et EB Garamond), Poppins (à la place
> d'Inter), URW Chancery (à la place de Homemade Apple). Les caractères coréens
> y figurent en romanisation (« Séoul » au lieu de 서울, « jeong » au lieu de 정),
> avec une mention rouge sur la fiche recto. Les gabarits InDesign finaux
> utilisent les polices indiquées en §0.2.

---

## 0. Maison

Éléments partagés par les trois pièces. À configurer une fois, à réutiliser partout.

### 0.1 Nuancier (Swatches)

| Nom de la nuance      | CMJN (CMYK)              | RVB approx.  | Hex      | Usage                                    |
|-----------------------|--------------------------|--------------|----------|------------------------------------------|
| Papier crème          | C4 M6 J16 N0             | 250 246 237  | #faf6ed  | Fond papier (couleur du site)            |
| Papier crème profond  | C6 M9 J22 N0             | 243 236 217  | #f3ecd9  | Variations, bordures internes            |
| Encre                 | C40 M55 J70 N75          | 42 36 29     | #2a241d  | Corps de texte                           |
| Encre douce           | C40 M48 J60 N40          | 107 93 77    | #6b5d4d  | Métadonnées, légendes                    |
| Encre fade            | C30 M35 J45 N15          | 160 146 128  | #a09280  | Filets et indications discrètes          |
| Filet                 | C18 M22 J42 N5           | 217 207 182  | #d9cfb6  | Filets et règles                         |
| Cachet (rouge sceau)  | C20 M82 J78 N15          | 168 68 58    | #a8443a  | Cachet rond, barre haute de la fiche     |
| Encre signature       | C85 M70 J45 N50          | 42 58 82     | #2a3a52  | Signature manuscrite, accents            |

> **Note CMJN.** Toutes les nuances sont définies pour un papier non-couché (offset, papier carte). Demander un BAT (bon à tirer) avant la première impression : sur papier crème non-couché, les noirs lourds peuvent baver — préférer le « Encre » composite à un noir 100 %.

### 0.2 Typographie

| Style                | Police                      | Variante                   | Usage                                   |
|----------------------|-----------------------------|----------------------------|-----------------------------------------|
| Display              | Cormorant Garamond          | Medium 500                 | Titres, marques, « Courrier de Séoul »  |
| Display italique     | Cormorant Garamond          | Italic 500                 | Notes, légendes courtes                 |
| Corps                | EB Garamond                 | Regular 400                | Corps de la lettre, verso fiche, message carte |
| Corps italique       | EB Garamond                 | Italic 400                 | Salutations, formules                   |
| Label                | Inter                       | Medium 500                 | Capitales étirées, libellés postaux     |
| Signature            | Homemade Apple              | Regular                    | Signature, mentions manuscrites         |
| Coréen (hangul)      | Noto Serif KR               | Medium 500                 | Caractères 서울, mots de la fiche       |

> **Approvisionnement.** Toutes ces polices sont gratuites (Google Fonts / SIL OFL). À installer dans Adobe Fonts ou localement, et à associer dans InDesign **avant** d'importer les styles.

### 0.3 Convention de nommage

- Nuances : `01_papier_creme`, `02_papier_creme_profond`, `03_encre`, `04_encre_douce`, `05_encre_fade`, `06_filet`, `07_cachet`, `08_encre_signature`.
- Styles de paragraphe : préfixés par la pièce : `LET/`, `CP/`, `FM/` (ex. `LET/Corps`, `CP/Adresse`, `FM/Mot`).
- Calques : `01-Fond`, `02-Image`, `03-Texte`, `04-Marques postales`, `05-Repères` (calque verrouillé, ne s'imprime pas).

---

## 1. La lettre

Une page A5 portrait, recto seul. Texte composé sur ordinateur, signée à l'encre après impression.

### 1.1 Document

| Réglage                | Valeur                                                |
|------------------------|-------------------------------------------------------|
| Format final (rogne)   | **148 × 210 mm** — A5 portrait                        |
| Fond perdu             | **0 mm** (pas d'élément à fond perdu)                 |
| Zone de sécurité       | 5 mm depuis la rogne                                  |
| Marges                 | Haut 22 · Bas 18 · Gauche 18 · Droite 18 mm           |
| Colonnes               | 1 colonne                                             |
| Grille de ligne de base| Tous les 5,7 mm, à partir de 22 mm de la rogne        |
| Pages                  | 1                                                     |
| Orientation            | Portrait                                              |

### 1.2 Zones

À placer sur le calque `03-Texte`, sauf indication contraire.

| Zone                  | Position (x, y) depuis coin haut-gauche | Taille (l × h) |
|-----------------------|-----------------------------------------|----------------|
| En-tête — marque      | 18, 18 mm                               | 60 × 12 mm     |
| En-tête — numéro      | 110, 18 mm (alignement droit à 130)     | 20 × 12 mm     |
| Filet supérieur       | 18, 33 mm                               | 112 × 0,2 mm   |
| Lieu et date          | 18, 37 mm                               | 112 × 6 mm     |
| Corps de la lettre    | 18, 47 mm                               | 112 × 140 mm   |
| Filet inférieur       | 18, 192 mm                              | 112 × 0,2 mm   |
| Pied — date           | 18, 196 mm                              | 60 × 6 mm      |
| Pied — pagination     | 110, 196 mm (alignement droit à 130)    | 20 × 6 mm      |

### 1.3 Styles de paragraphe

| Style              | Police              | Corps / Interligne | Approche | Notes                                  |
|--------------------|---------------------|--------------------|----------|----------------------------------------|
| `LET/Marque`       | Cormorant 500       | 16 / 19 pt         | 10       | Sur deux lignes : « Courrier de Séoul » + « 서울 · une lettre par mois » (libellé Inter Medium 7 pt, capitales étirées 220) |
| `LET/Numéro`       | Inter Medium        | 8,5 / 12 pt        | 220      | Capitales. « LETTRE N° 05 · MAI 2026 », fer à droite |
| `LET/Lieu`         | EB Garamond Italic  | 11 / 16 pt         | 0        | « Séoul, le 12 mai 2026. »             |
| `LET/Salutation`   | EB Garamond Italic  | 11 / 16 pt         | 0        | « Chère lectrice, cher lecteur, »      |
| `LET/Corps`        | EB Garamond Regular | 11 / 16 pt         | 0        | Justifié, césure activée (FR). Alinéa 0 (ligne sautée à la place). |
| `LET/Formule`      | EB Garamond Italic  | 11 / 16 pt         | 0        | « Bien à vous, » — au-dessus de la signature |
| `LET/Signature`    | Homemade Apple      | 22 pt              | 0        | Couleur `08_encre_signature`. Rotation -3°. Manuscrite (note : la signature finale est ajoutée à l'encre après impression — ceci n'est qu'une réservation visuelle). |
| `LET/Pied`         | Inter Medium        | 7,5 / 11 pt        | 220      | Capitales. « SÉOUL · 서울 · 12.05.2026 » à gauche, « — 1 / 1 — » à droite |

### 1.4 Filets

- Filet supérieur et inférieur : épaisseur **0,2 pt**, couleur `06_filet`, sans pointillés.

### 1.5 Remarques

- **Réservation pour signature manuscrite.** Laisser 35 mm de hauteur libre sous la formule de politesse pour l'apposition de la signature à l'encre.
- **Mois de l'année.** Stocker le mois et le numéro d'édition dans une variable de texte InDesign (« Mois », « Numéro ») pour ne modifier qu'un endroit à chaque édition.

---

## 2. La carte postale

Format paysage, recto image / verso postal. Imprimée sur papier carte 300–350 g/m², coupes nettes, sans coins arrondis (sauf préférence ultérieure).

### 2.1 Document

| Réglage                | Valeur                                                |
|------------------------|-------------------------------------------------------|
| Format final (rogne)   | **150 × 100 mm** — paysage                            |
| Format de travail      | **154 × 104 mm** (fond perdu inclus)                  |
| Fond perdu             | **2 mm** sur les 4 côtés                              |
| Zone de sécurité       | 4 mm depuis la rogne                                  |
| Marges                 | Haut 4 · Bas 4 · Gauche 4 · Droite 4 mm               |
| Pages                  | 2 — page 1 = recto image, page 2 = verso postal       |
| Orientation            | Paysage                                               |

### 2.2 Page 1 — Recto (image)

L'image (photographie ou dessin) couvre la quasi-totalité de la carte avec un débord de 2 mm.

| Zone                           | Position (x, y) | Taille (l × h) | Notes                                         |
|--------------------------------|-----------------|----------------|-----------------------------------------------|
| Bloc image                     | -2, -2 mm       | 154 × 104 mm   | Calque `02-Image`. À fond perdu sur 4 côtés.  |
| Bandeau blanc bas (optionnel)  | -2, 92 mm       | 154 × 14 mm    | Papier crème. Pour assise de la légende.       |
| Légende                        | 6, 95 mm        | 80 × 6 mm      | Cormorant Italic 11 pt. Ex. « Bukchon, fin d'après-midi. » |
| Pastille n° édition            | 124, 6 mm       | 22 × 8 mm      | Inter Medium 7,5 pt, capitales étirées 220. Fond `01_papier_creme` à 85 % d'opacité, contour `06_filet` 0,3 pt. |

### 2.3 Page 2 — Verso (postal)

Convention postale : message à gauche, adresse à droite, timbre haut-droite.

| Zone                       | Position (x, y) | Taille (l × h) | Notes                                                          |
|----------------------------|-----------------|----------------|----------------------------------------------------------------|
| Filet médian vertical      | 75, 8 mm        | 0,3 × 84 mm    | `06_filet`. Sépare message / adresse.                          |
| Marque haut-gauche         | 6, 8 mm         | 60 × 10 mm     | Cormorant 500 11 pt, « Courrier de Séoul » + libellé Inter 6 pt sous, « CARTE DU MOIS · MAI 2026 ». |
| Lignes de message          | 6, 24 mm        | 66 × 50 mm     | 6 lignes ; filets `06_filet` 0,2 pt espacés de 8 mm.            |
| Cachet rond (Séoul · date) | 6, 80 mm        | 14 × 14 mm     | Cercle 14 mm de Ø, contour `07_cachet` 0,8 pt, légère rotation -8°. Texte Cormorant Italic 6 pt « SÉOUL · 12·V·26 ». |
| Réserve timbre             | 128, 6 mm       | 20 × 24 mm     | Cadre pointillé `05_encre_fade` 0,4 pt. Étiquette Inter Medium 6 pt « TIMBRE / ICI » centrée.|
| Lignes d'adresse           | 80, 36 mm       | 64 × 32 mm     | 4 lignes ; filets `06_filet` 0,2 pt espacés de 8 mm.            |
| Mention adresse            | 80, 86 mm       | 64 × 4 mm      | Inter Medium 6 pt, capitales étirées 220, fer à droite. « — DESTINATAIRE — » couleur `05_encre_fade`. |

### 2.4 Styles de paragraphe (carte postale)

| Style                   | Police               | Corps / Interligne | Approche | Couleur            |
|-------------------------|----------------------|--------------------|----------|--------------------|
| `CP/Marque`             | Cormorant 500        | 11 / 13 pt         | 10       | `03_encre`         |
| `CP/Marque-soustitre`   | Inter Medium         | 6 / 9 pt           | 220      | `04_encre_douce`   |
| `CP/Légende`            | Cormorant Italic 500 | 11 / 14 pt         | 0        | `03_encre`         |
| `CP/Cachet`             | Cormorant Italic 500 | 6 / 7,5 pt         | 30       | `07_cachet`        |
| `CP/Adresse-mention`    | Inter Medium         | 6 / 9 pt           | 220      | `05_encre_fade`    |
| `CP/Numéro-pastille`    | Inter Medium         | 7,5 / 9 pt         | 220      | `03_encre`         |

### 2.5 Remarques

- **Image à fond perdu.** Vérifier que la photographie ou le dessin du mois couvre les 154 × 104 mm (gabarit avec débord). Important pour éviter toute bordure blanche après rognage.
- **Filets pour écriture manuelle.** Le destinataire peut écrire un mot par-dessus la carte. Les filets sont volontairement clairs (`06_filet`) pour ne pas concurrencer l'écriture à l'encre.
- **Réglementation La Poste.** Format 100 × 150 mm conforme à la « Lettre verte » carte postale en France. Adresse à droite, affranchissement à droite : conforme.

---

## 3. La fiche mémoire

Format carte de visite, recto / verso, papier carte 280–320 g/m². À glisser dans un agenda ou à punaiser.

### 3.1 Document

| Réglage                | Valeur                                                |
|------------------------|-------------------------------------------------------|
| Format final (rogne)   | **85 × 55 mm** — paysage (carte de visite européenne) |
| Format de travail      | **89 × 59 mm** (fond perdu inclus)                    |
| Fond perdu             | **2 mm** sur les 4 côtés                              |
| Zone de sécurité       | 3 mm depuis la rogne                                  |
| Marges                 | Haut 3 · Bas 3 · Gauche 3 · Droite 3 mm               |
| Pages                  | 2 — page 1 = recto (mot), page 2 = verso (définition) |
| Orientation            | Paysage                                               |

### 3.2 Page 1 — Recto (mot)

| Zone                       | Position (x, y) | Taille (l × h) | Notes                                                                                       |
|----------------------------|-----------------|----------------|---------------------------------------------------------------------------------------------|
| Barre haute rouge          | -2, -2 mm       | 89 × 4 mm      | Fond `07_cachet`. À fond perdu sur trois côtés. Marqueur visuel pour identifier la fiche au premier coup d'œil. |
| Libellé fiche              | 5, 6 mm         | 60 × 4 mm      | « FICHE N° 05 · MAI 2026 · MOT »                                                            |
| Mot principal (hangul ou FR)| 5, 14 mm       | 75 × 24 mm     | Centré verticalement dans la zone, fer à gauche.                                            |
| Prononciation              | 5, 38 mm        | 75 × 5 mm      | « jeong · [tɕʌŋ] »                                                                          |
| Catégorie grammaticale     | 5, 44 mm        | 75 × 4 mm      | « NOM · CORÉEN » (capitales étirées)                                                        |
| Pied — mention             | 5, 49 mm        | 35 × 4 mm      | « À RETENIR »                                                                               |
| Pied — face                | 65, 49 mm       | 18 × 4 mm      | « — RECTO — », fer à droite                                                                 |

### 3.3 Page 2 — Verso (définition)

| Zone                       | Position (x, y) | Taille (l × h) | Notes                                                                          |
|----------------------------|-----------------|----------------|--------------------------------------------------------------------------------|
| Petit titre italique       | 5, 5 mm         | 75 × 4 mm      | « — ce qu'il faut savoir — » en `07_cachet`                                    |
| Définition                 | 5, 11 mm        | 75 × 30 mm     | EB Garamond 8,5 / 11,5 pt. Texte justifié avec césure. Garder court : 25–35 mots maximum. |
| Exemple                    | 5, 42 mm        | 75 × 6 mm      | Hangul (Noto Serif KR) + traduction italique                                   |
| Pied — marque              | 5, 49 mm        | 60 × 4 mm      | « COURRIER DE SÉOUL »                                                          |
| Pied — face                | 65, 49 mm       | 18 × 4 mm      | « — VERSO — »                                                                  |

### 3.4 Styles de paragraphe (fiche mémoire)

| Style                  | Police                  | Corps / Interligne | Approche | Couleur            |
|------------------------|-------------------------|--------------------|----------|--------------------|
| `FM/Libellé`           | Inter Medium            | 6,5 / 9 pt         | 230      | `04_encre_douce`   |
| `FM/Mot`               | Noto Serif KR Medium    | 32 / 32 pt         | 0        | `03_encre`         |
| `FM/Mot-latin` (variante FR/EN) | Cormorant 500  | 28 / 28 pt         | 5        | `03_encre`         |
| `FM/Prononciation`     | Cormorant Italic 500    | 11 / 13 pt         | 5        | `04_encre_douce`   |
| `FM/Catégorie`         | Inter Medium            | 7 / 10 pt          | 200      | `05_encre_fade`    |
| `FM/V-titre`           | Cormorant Italic 500    | 9,5 / 12 pt        | 10       | `07_cachet`        |
| `FM/V-définition`      | EB Garamond Regular     | 8,5 / 11,5 pt      | 0        | `03_encre`         |
| `FM/V-exemple`         | EB Garamond Italic      | 8,5 / 11,5 pt      | 0        | `04_encre_douce`   |
| `FM/V-exemple-hangul`  | Noto Serif KR Regular   | 9 / 11,5 pt        | 0        | `03_encre`         |
| `FM/Pied`              | Inter Medium            | 6 / 8 pt           | 230      | `05_encre_fade`    |

### 3.5 Remarques

- **Taxonomie suggérée.** Trois catégories en rotation : `MOT`, `CONCEPT`, `FAIT`. Inscrire l'étiquette à la fois sur le recto (en haut, dans le libellé) et conserver une cohérence visuelle d'un mois à l'autre.
- **Lisibilité du verso.** Avec 30 mots maximum, le verso reste lisible à bout de bras. Tester chaque édition en imprimant la fiche à l'échelle 100 % avant validation.
- **Variation hangul / latin.** Lorsque le mot du mois est en français ou en anglais, basculer du style `FM/Mot` (Noto Serif KR) vers `FM/Mot-latin` (Cormorant). Garder la position du bloc identique.

---

## 4. Liste de contrôle avant impression

À cocher avant chaque envoi mensuel.

- [ ] Le mois et le numéro d'édition ont été mis à jour dans les variables de texte.
- [ ] La photographie ou le dessin du mois est en CMJN, 300 dpi, à fond perdu.
- [ ] La signature manuscrite est apposée à l'encre **après** impression (pas dans le fichier).
- [ ] Les filets sont en surimpression (« overprint stroke ») : à vérifier dans la palette Attributs.
- [ ] Aplats noirs lourds remplacés par `03_encre` composite.
- [ ] Export PDF/X-1a:2003 avec traits de coupe et fond perdu 2 mm (postcard, fiche) ou 0 mm (lettre).
- [ ] BAT papier validé pour chaque nouvelle référence imprimeur.

---

## 5. Préréglage d'export PDF (à enregistrer dans InDesign)

| Réglage              | Valeur                                                         |
|----------------------|----------------------------------------------------------------|
| Standard             | PDF/X-1a:2003                                                  |
| Compatibilité        | Acrobat 4 (PDF 1.3)                                            |
| Compression          | JPEG max — couleur 300 ppp, gris 300 ppp, monochrome 1200 ppp  |
| Repères              | Traits de coupe activés, décalage 2 mm, épaisseur 0,25 pt      |
| Fond perdu           | Utiliser les paramètres du document (2 mm postcard/fiche ; 0 mm lettre) |
| Gestion des couleurs | Convertir en destination, profil FOGRA39 (Coated FOGRA39) ou ISO Coated v2 selon imprimeur. À ajuster pour papier non-couché. |
| Polices              | Tous les caractères incorporés (≥ 100 %)                       |

Enregistrer ce préréglage sous le nom : **`Courrier_PDFX1a_2mm`**.

---

*Document de référence — Courrier de Séoul · Studio Monjo · Séoul.*
