# EmployaLingua® — Deploy Package
## Pathfinder Educational Ltd · pthfndr.org

---

## ⚠️ BEFORE DEPLOYING

Open `index.html`, search for `SUPABASE_CONFIG` and replace:
```
const SB_URL = 'YOUR_SUPABASE_URL';
const SB_KEY = 'YOUR_SUPABASE_ANON_KEY';
```
With:
```
const SB_URL = 'https://etwgddsxrapshjlylimx.supabase.co';
const SB_KEY = '<your anon key from Supabase → Settings → API → Legacy>';
```

---

## File structure (21 files)

```
deploy/
├── index.html                    ← Commissioner landing page ⚠️ add credentials
├── sitemap.xml                   ← 18 URLs — resubmit to Google Search Console
├── robots.txt
├── learn/
│   └── index.html                ← Learner page
├── research/
│   ├── index.html                ← Research hub
│   ├── underemployment-gap/
│   │   └── index.html
│   ├── why-esol-fails/
│   │   └── index.html
│   ├── language-barrier-nhs/
│   │   └── index.html
│   ├── vocational-fluency-vs-esol/
│   │   └── index.html
│   └── trapezium-identity-first/
│       └── index.html
├── manchester/index.html         ← 10 GM borough pages
├── salford/index.html
├── trafford/index.html
├── tameside/index.html
├── bolton/index.html
├── oldham/index.html
├── rochdale/index.html
├── stockport/index.html
├── wigan/index.html
├── bury/index.html
└── supabase/
    └── functions/
        └── confirmation-email/
            └── index.ts          ← Email function (redeploy only if changed)
```

---

## Deploy to Cloudflare Pages

```bash
cd ~/Downloads/Employalingua

# 1. Add Supabase credentials to index.html (see above)
# 2. Copy all files into your repo, preserving folder structure
cp -r deploy/. .

# 3. Push
git add .
git commit -m "Full site — research hub, GM pages, Trapezium Model, ROI calculator"
git push
```

Cloudflare redeploys automatically within 60 seconds of push.

---

## Edge Function (emails + Outlook booking)

Only run this if you changed index.ts:
```bash
supabase functions deploy confirmation-email --no-verify-jwt
```

---

## After deployment — Google Search Console

Delete old sitemap and resubmit:
`https://employalingua.com/sitemap.xml`

Then Request Indexing for:
- employalingua.com/research/
- employalingua.com/research/underemployment-gap/
- employalingua.com/research/why-esol-fails/
- employalingua.com/research/language-barrier-nhs/
- employalingua.com/research/vocational-fluency-vs-esol/
- employalingua.com/research/trapezium-identity-first/

---

## Live URLs after deployment

| Page | URL |
|---|---|
| Commissioner | employalingua.com |
| Learner | employalingua.com/learn |
| Research hub | employalingua.com/research |
| The underemployment gap | employalingua.com/research/underemployment-gap |
| Why ESOL fails | employalingua.com/research/why-esol-fails |
| Language barrier NHS | employalingua.com/research/language-barrier-nhs |
| Vocational fluency vs ESOL | employalingua.com/research/vocational-fluency-vs-esol |
| Identity-first learning | employalingua.com/research/trapezium-identity-first |
| Manchester | employalingua.com/manchester |
| Salford | employalingua.com/salford |
| Trafford | employalingua.com/trafford |
| Tameside | employalingua.com/tameside |
| Bolton | employalingua.com/bolton |
| Oldham | employalingua.com/oldham |
| Rochdale | employalingua.com/rochdale |
| Stockport | employalingua.com/stockport |
| Wigan | employalingua.com/wigan |
| Bury | employalingua.com/bury |

---

*EmployaLingua® · Pathfinder Educational Ltd (Co. No. 15659558)*
*pthfndr.org · support@employalingua.com · GM Digital Security Hub, 47 Lloyd Street, Manchester, M2 5LE*
