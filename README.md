# Alejandro Ruiz — Acupuntura y Osteopatía

Site static de prezentare + sistem de programări. Fără build, fără dependințe de instalat:
sunt fișiere HTML/CSS/JS care merg direct pe GitHub Pages.

```
index.html        pagina principală (hero, servicii, metodă, despre, recenzii, formular, FAQ)
agenda.html       zona privată a lui Alejandro: vede/confirmă/anulează programări
legal.html        aviso legal + politică de confidențialitate (șablon RGPD/LOPDGDD)
js/config.js      ⇦ SINGURUL fișier de editat: telefon, adresă, orar, servicii, prețuri
js/main.js        logica paginii publice + formularul de programare
js/agenda.js      logica agendei private
js/db.js          conexiunea la baza de date (opțională)
css/styles.css    tot designul
assets/           variantele de logo (vezi secțiunea 6)
supabase/schema.sql  scriptul de bază de date
```

---

## 1. Vizualizare locală

```bash
cd SALON_ALEX
python3 -m http.server 8000
# deschide http://localhost:8000
```

(Deschis direct cu dublu-click pe `index.html` merge și el, dar serverul e mai fidel.)

---

## 2. Publicare pe GitHub Pages

```bash
cd SALON_ALEX
git init
git add .
git commit -m "Sitio web Alejandro Ruiz"
git branch -M main
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

Apoi în repo: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
În ~1 minut site-ul e live la `https://USUARIO.github.io/REPO/`.

Fișierul `.nojekyll` e deja inclus (evită probleme cu procesarea Jekyll).

---

## 3. Ce mai trebuie completat

Aproape tot e pus. Rămâne, în [js/config.js](js/config.js):

| Câmp | Stare |
|---|---|
| telefon, email, adresă, oraș | ✅ date reale |
| orar, franje orare | ✅ L–V 10:00–13:30 / 15:00–19:30, sâmbătă la clinică |
| servicii și prețuri | ✅ 45 € ședința, presoterapie 15 €, bono 130 €, distanță 30 € |
| `testimonios` | ⚠️ **listă goală** — secțiunea e ascunsă până are recenzii reale |
| `instagram` | gol = butonul e ascuns |
| biografia din „Sobre mí" | ⚠️ Alejandro o trimite pe WhatsApp (marcată cu comentariu în `index.html`) |
| NIF + adresă în [legal.html](legal.html) | ⚠️ `[pendiente]` |

Ce am evitat deliberat în texte: cuvântul **„tratar"** și orice formulare care l-ar prezenta
ca medic. Peste tot se folosește *ayudar*, *acompañamiento*, *sesión*.

---

## 4. Programări online — Supabase

**Baza de date aleasă: [Supabase](https://supabase.com) (PostgreSQL).** Motive:

- plan gratuit permanent, fără card
- servere în UE (Frankfurt / Irlanda) → conform RGPD
- merge direct dintr-un site static, fără server propriu
- are autentificare inclusă pentru zona privată a lui Alex

Alternative respinse: Firebase (servere US by default), Google Sheets (fără control de acces
real), Airtable (gratuitul e limitat la 1.000 rânduri și e greu de securizat).

**Fără configurare** site-ul funcționează deja: formularul validează datele și trimite
cererea pre-completată pe WhatsApp. Zero date stocate.

**Cu Supabase** se activează agenda completă. Pași:

1. Cont pe [supabase.com](https://supabase.com) → **New project** → regiune **EU (Frankfurt)**
2. **SQL Editor** → lipește tot din [supabase/schema.sql](supabase/schema.sql) → **Run**
3. **Authentication → Users → Add user**: contul lui Alejandro (email + parolă) — e login-ul de la `agenda.html`
4. **Authentication → Providers → Email**: dezactivează *Enable signup*
5. **Project Settings → API**: copiază `Project URL` și cheia `anon public` în [js/config.js](js/config.js)

```js
supabase: {
  url: "https://xxxxxxxx.supabase.co",
  anonKey: "eyJhbGciOi..."
}
```

### Ce vede fiecare

| | Client (oricine) | Alejandro (logat) |
|---|---|---|
| Orele libere ale unei zile | ✅ | ✅ |
| Numele/telefonul altor pacienți | ❌ imposibil | ✅ |
| Lista completă de programări | ❌ | ✅ |
| Modificare zi/oră/serviciu | ❌ | ✅ |
| Anulare / ștergere | ❌ | ✅ |
| Blocare zi sau oră | ❌ | ✅ |
| Istoric de modificări | ❌ | ✅ |

Clientul **nu poate citi tabelul deloc**. Are acces doar la două funcții:
`disponibilidad(zi)` care returnează strict orele ocupate (fără nume, fără telefon), și
`solicitar_cita(...)` care validează și inserează. Asta e garantat de politicile RLS din
`schema.sql`, nu de codul JavaScript — deci nu se poate ocoli din browser.

### Agenda lui Alejandro (`agenda.html`)

- **Cuaderno pe zile**: programările grupate pe zi, cu nume, telefon, serviciu, note
- **Editar**: schimbă ziua, ora, serviciul, starea, datele de contact — tot
- **Confirmar / Anular**: un click
- **Nota privada**: text pe care doar el îl vede (🔒), invizibil pentru client
- **Bloquear día u hora**: zi întreagă (vacanță, formare) sau doar o franjă. Dispare imediat din calendarul public
- **Historial**: cine, când și ce a schimbat la fiecare programare (tabel `citas_log`, completat automat de un trigger)
- **Filtre**: Azi / 7 zile / 30 zile / Trecute / Toate

> Notă: proiectele Supabase gratuite se suspendă după ~7 zile fără nicio activitate și se
> reactivează cu un click din dashboard.

---

## 5. Logo — de ce sunt patru fișiere

`Alex_Salon.svg` (sursa) **nu are fundal transparent**: are un dreptunghi alb pe toată pânza,
iar litera A e desenată cu **forme albe de mascare** peste R. Dacă ștergi fundalul, rămân
paralelograme albe vizibile peste literă — deci varianta „transparentă" nu funcționează.

Soluția: variante recolorate pentru fiecare fundal, generate din sursă:

| Fișier | Fundal/mască | Desen | Unde se folosește |
|---|---|---|---|
| `logo.svg` | alb | tuș | rama albă din hero (AR + „ALEJANDRO RUIZ") |
| `monograma-blanco.svg` | alb | tuș | cardul alb din „Sobre mí" |
| `monograma-crema.svg` | `#F7F4EE` | tuș | header (fundal crem) |
| `monograma-oscuro.svg` | `#14170F` | crem | footer (fundal închis) |

Monogramele sunt decupate doar pe „AR" (fără cuvântul de sub el), ca să rămână lizibile la
32–56px pe telefon.

**Dacă schimbi logo-ul:** înlocuiește `Alex_Salon.svg` și cere-mi să regenerez variantele —
altfel trebuie refăcute manual (recolorare + decupare `viewBox`).

---

## 6. Legal (Spania)

- `legal.html` e un **șablon** cu aviso legal, politică de confidențialitate și cookies,
  aliniat la RGPD, LOPDGDD și LSSI. Trebuie completate NIF-ul și adresa reală.
- Formularul cere consimțământ explicit bifat, nu are casete pre-bifate, și avertizează
  să nu se scrie detalii clinice în câmpul de observații.
- Site-ul **nu** folosește cookies de analiză sau publicitate, deci nu are nevoie de banner
  de cookies. Dacă mai târziu se adaugă Google Analytics, va fi nevoie de unul.
- Textele evită promisiuni de vindecare și includ avertisment sanitar — cerință a
  reglementărilor spaniole de publicitate sanitară.
- Dacă are număr de colegiat / autorizație sanitară a centrului, e recomandat să apară în
  footer și în aviso legal.

---

## 7. Mutarea site-ului pe contul lui Alejandro

Ca să nu apară numele contului meu în adresă (`razvantdf.github.io/...`), sunt trei
variante, de la cea mai simplă la cea mai curată.

### Varianta A — Transferul repo-ului (recomandată, 2 minute)

În repo, pe GitHub: **Settings → General → Danger Zone → Transfer ownership**
→ scrie username-ul lui Alejandro → confirmă.

- Adresa devine `https://USERALEX.github.io/alejandro-ruiz/`
- GitHub redirecționează automat vechea adresă către cea nouă
- **Important:** după transfer trebuie reactivat Pages din *Settings → Pages* pe contul lui
- Tu rămâi cu acces dacă el te adaugă la **Settings → Collaborators**; apoi actualizezi remote-ul local:

```bash
git remote set-url origin https://github.com/USERALEX/alejandro-ruiz.git
```

Alejandro trebuie să accepte transferul dintr-un email pe care GitHub i-l trimite.

### Varianta B — Repo nou pe contul lui, cu istoric curat

Dacă vrei ca nici în istoricul commit-urilor să nu apară numele tău (transferul păstrează
istoricul, deci și autorul commit-urilor):

```bash
cd ~/Desktop/SALON_ALEX
rm -rf .git
git init
git config user.name  "Alejandro Ruiz"
git config user.email "Ruiz.alexdominguez@gmail.com"
git add .
git commit -m "Web Alejandro Ruiz"
git branch -M main
git remote add origin https://github.com/USERALEX/alejandro-ruiz.git
git push -u origin main
```

Logat cu contul lui (sau cu un token generat din contul lui). Apoi *Settings → Pages →
main / (root)*.

### Varianta C — Domeniu propriu (cel mai profesional)

Un domeniu de tipul `alejandroruizacupuntura.es` costă ~10 €/an. Se adaugă în
*Settings → Pages → Custom domain* și atunci nu mai apare niciun username, indiferent pe
ce cont stă repo-ul. Merge combinat cu A sau B.

> Notă: GitHub Pages pe repo **privat** cere cont Pro. Repo-ul trebuie să rămână public —
> nu e o problemă, nu conține date de pacienți (acelea stau în Supabase, nu în cod).
