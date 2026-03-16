<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>TroTot — Tìm phòng trọ dễ dàng</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #1A5CFF;
    --primary-light: #EEF3FF;
    --primary-dark: #1040CC;
    --accent: #FF5C35;
    --accent-light: #FFF0EC;
    --text-primary: #0D1117;
    --text-secondary: #5A6070;
    --text-muted: #9AA0AD;
    --bg: #F7F8FC;
    --surface: #FFFFFF;
    --border: #E4E7EE;
    --border-hover: #C8CDDB;
    --tag-bg: #EEF3FF;
    --tag-text: #1A5CFF;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 18px;
    --radius-xl: 24px;
    --radius-full: 999px;
    --shadow-sm: 0 1px 4px rgba(13,17,23,0.06), 0 2px 8px rgba(13,17,23,0.04);
    --shadow-md: 0 4px 16px rgba(13,17,23,0.08), 0 1px 4px rgba(13,17,23,0.04);
    --shadow-lg: 0 8px 32px rgba(13,17,23,0.12), 0 2px 8px rgba(13,17,23,0.06);
    --font: 'Be Vietnam Pro', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text-primary);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ─── NAV ─── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(247,248,252,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
  }
  .nav-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
  }
  .logo {
    display: flex; align-items: center; gap: 8px;
    font-size: 20px; font-weight: 800; color: var(--text-primary);
    text-decoration: none; letter-spacing: -0.5px;
  }
  .logo-dot { color: var(--primary); }
  .logo-icon {
    width: 32px; height: 32px; background: var(--primary); border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-icon svg { width: 18px; height: 18px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .nav-links {
    display: flex; align-items: center; gap: 2rem;
    list-style: none;
  }
  .nav-links a {
    font-size: 14px; font-weight: 500; color: var(--text-secondary);
    text-decoration: none; transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text-primary); }
  .nav-actions { display: flex; align-items: center; gap: 10px; }
  .btn-ghost {
    padding: 8px 18px; border-radius: var(--radius-full);
    border: 1px solid var(--border); background: transparent;
    font-family: var(--font); font-size: 14px; font-weight: 500;
    color: var(--text-primary); cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: var(--border-hover); background: var(--surface); }
  .btn-primary {
    padding: 8px 20px; border-radius: var(--radius-full);
    border: none; background: var(--primary);
    font-family: var(--font); font-size: 14px; font-weight: 600;
    color: #fff; cursor: pointer; transition: all 0.2s;
  }
  .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }

  /* ─── HERO ─── */
  .hero {
    max-width: 1200px; margin: 0 auto;
    padding: 80px 2rem 60px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  .hero-label {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accent-light); color: var(--accent);
    font-size: 12px; font-weight: 600; padding: 5px 12px;
    border-radius: var(--radius-full); margin-bottom: 20px;
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .hero-label span { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; display: inline-block; }
  h1 {
    font-size: clamp(36px, 4vw, 54px); font-weight: 800;
    line-height: 1.1; letter-spacing: -1.5px;
    color: var(--text-primary); margin-bottom: 20px;
  }
  h1 em {
    font-family: 'Instrument Serif', serif;
    font-style: italic; color: var(--primary);
  }
  .hero-sub {
    font-size: 17px; color: var(--text-secondary);
    line-height: 1.7; margin-bottom: 36px; max-width: 440px;
    font-weight: 400;
  }
  .hero-cta { display: flex; gap: 12px; align-items: center; }
  .btn-hero {
    padding: 14px 28px; border-radius: var(--radius-full);
    border: none; background: var(--primary); color: #fff;
    font-family: var(--font); font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(26,92,255,0.35);
  }
  .btn-hero:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 28px rgba(26,92,255,0.45); }
  .btn-secondary-hero {
    padding: 14px 24px; border-radius: var(--radius-full);
    border: 1.5px solid var(--border); background: var(--surface); color: var(--text-primary);
    font-family: var(--font); font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-secondary-hero:hover { border-color: var(--primary); color: var(--primary); }
  .hero-stats {
    display: flex; gap: 28px; margin-top: 40px; padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .stat-item { }
  .stat-num { font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
  .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 400; margin-top: 2px; }

  /* ─── HERO VISUAL ─── */
  .hero-visual { position: relative; }
  .hero-card-main {
    background: var(--surface); border-radius: var(--radius-xl);
    border: 1px solid var(--border); padding: 0; overflow: hidden;
    box-shadow: var(--shadow-lg);
    animation: floatUp 0.8s ease-out both;
  }
  @keyframes floatUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hero-card-img {
    width: 100%; height: 220px; object-fit: cover;
    display: block; background: linear-gradient(135deg, #1A5CFF 0%, #7B9FFF 100%);
    position: relative; overflow: hidden;
  }
  .hero-card-img-inner {
    width: 100%; height: 100%;
    background: linear-gradient(160deg, #C8D9FF 0%, #7BA7FF 40%, #4072F0 80%, #1A3FCC 100%);
    position: relative;
  }
  .room-svg-preview {
    position: absolute; bottom: 0; left: 0; right: 0;
  }
  .hero-card-body { padding: 18px 20px; }
  .card-location {
    font-size: 11px; font-weight: 600; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;
    display: flex; align-items: center; gap: 4px;
  }
  .card-location svg { width: 12px; height: 12px; stroke: var(--text-muted); fill: none; stroke-width: 2; }
  .card-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
  .card-row { display: flex; align-items: center; justify-content: space-between; }
  .card-price { font-size: 20px; font-weight: 800; color: var(--primary); }
  .card-price span { font-size: 12px; font-weight: 400; color: var(--text-muted); }
  .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .tag {
    font-size: 11px; font-weight: 600; padding: 4px 10px;
    border-radius: var(--radius-full); background: var(--tag-bg); color: var(--tag-text);
  }
  .tag.green { background: #EDFAF3; color: #0E7A4A; }
  .tag.orange { background: #FFF3EC; color: #CC4400; }

  .card-rating { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
  .stars { color: #F5A623; letter-spacing: 0px; font-size: 12px; }

  /* floating mini cards */
  .float-badge {
    position: absolute;
    background: var(--surface); border-radius: var(--radius-lg);
    border: 1px solid var(--border); box-shadow: var(--shadow-md);
    padding: 10px 14px; font-size: 13px;
  }
  .float-badge-1 {
    top: -16px; right: -20px;
    display: flex; align-items: center; gap: 8px;
    animation: floatUp 1s 0.2s ease-out both;
  }
  .float-badge-2 {
    bottom: 20px; left: -24px;
    animation: floatUp 1s 0.4s ease-out both;
  }
  .badge-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: var(--primary-light); display: flex; align-items: center; justify-content: center;
  }
  .badge-icon svg { width: 16px; height: 16px; stroke: var(--primary); fill: none; stroke-width: 2; }
  .badge-text { font-weight: 700; font-size: 14px; }
  .badge-sub { font-size: 11px; color: var(--text-muted); font-weight: 400; }

  /* ─── SEARCH BAR ─── */
  .search-section {
    max-width: 1200px; margin: 0 auto 60px;
    padding: 0 2rem;
  }
  .search-box {
    background: var(--surface); border-radius: var(--radius-xl);
    border: 1px solid var(--border); padding: 20px 24px;
    box-shadow: var(--shadow-md);
    display: grid; grid-template-columns: 1fr 180px 180px 160px;
    gap: 0; align-items: center;
  }
  .search-field {
    padding: 0 20px; border-right: 1px solid var(--border);
  }
  .search-field:first-child { padding-left: 0; }
  .search-field label { display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .search-field input, .search-field select {
    width: 100%; border: none; outline: none; background: transparent;
    font-family: var(--font); font-size: 15px; font-weight: 500;
    color: var(--text-primary);
  }
  .search-field select { cursor: pointer; }
  .search-action { padding-left: 20px; }
  .btn-search {
    width: 100%; padding: 12px 20px; border-radius: var(--radius-full);
    border: none; background: var(--primary); color: #fff;
    font-family: var(--font); font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }
  .btn-search:hover { background: var(--primary-dark); }
  .btn-search svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2.5; }

  /* quick filters */
  .quick-filters {
    display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;
  }
  .filter-chip {
    padding: 6px 14px; border-radius: var(--radius-full);
    border: 1px solid var(--border); background: var(--surface);
    font-size: 13px; font-weight: 500; color: var(--text-secondary);
    cursor: pointer; transition: all 0.2s;
  }
  .filter-chip:hover, .filter-chip.active {
    border-color: var(--primary); color: var(--primary);
    background: var(--primary-light);
  }

  /* ─── LISTINGS ─── */
  .section {
    max-width: 1200px; margin: 0 auto;
    padding: 0 2rem 60px;
  }
  .section-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 28px;
  }
  .section-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .section-title em { font-family: 'Instrument Serif', serif; font-style: italic; color: var(--primary); }
  .section-link {
    font-size: 14px; font-weight: 600; color: var(--primary);
    text-decoration: none; display: flex; align-items: center; gap: 4px;
  }
  .section-link:hover { text-decoration: underline; }

  .listings-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .listing-card {
    background: var(--surface); border-radius: var(--radius-lg);
    border: 1px solid var(--border); overflow: hidden;
    cursor: pointer; transition: all 0.25s;
  }
  .listing-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-hover);
  }
  .listing-img {
    width: 100%; height: 200px; position: relative; overflow: hidden;
  }
  .listing-img-bg {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 48px;
  }
  .img-1 { background: linear-gradient(135deg, #E0EAFF 0%, #C7D9FF 100%); }
  .img-2 { background: linear-gradient(135deg, #FFF0F0 0%, #FFD6D6 100%); }
  .img-3 { background: linear-gradient(135deg, #F0FFF4 0%, #C6F6D5 100%); }
  .img-4 { background: linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%); }
  .img-5 { background: linear-gradient(135deg, #F0F4FF 0%, #DBEAFE 100%); }
  .img-6 { background: linear-gradient(135deg, #FDF4FF 0%, #F0D9FF 100%); }

  .listing-fav {
    position: absolute; top: 12px; right: 12px;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.9); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .listing-fav:hover { background: #fff; transform: scale(1.1); }
  .listing-fav svg { width: 16px; height: 16px; stroke: #E53E3E; fill: none; stroke-width: 2; }
  .listing-fav.liked svg { fill: #E53E3E; }

  .listing-badge {
    position: absolute; top: 12px; left: 12px;
    font-size: 11px; font-weight: 700; padding: 4px 10px;
    border-radius: var(--radius-full); letter-spacing: 0.3px;
  }
  .badge-new { background: var(--accent); color: #fff; }
  .badge-hot { background: #FFA000; color: #fff; }

  .listing-body { padding: 16px; }
  .listing-location {
    font-size: 11px; font-weight: 600; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px;
    display: flex; align-items: center; gap: 4px;
  }
  .listing-location svg { width: 11px; height: 11px; stroke: var(--text-muted); fill: none; stroke-width: 2; }
  .listing-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; line-height: 1.35; }
  .listing-meta {
    display: flex; gap: 14px; margin-bottom: 12px;
  }
  .meta-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: var(--text-secondary);
  }
  .meta-item svg { width: 13px; height: 13px; stroke: var(--text-muted); fill: none; stroke-width: 2; }
  .listing-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid var(--border);
  }
  .listing-price { font-size: 17px; font-weight: 800; color: var(--primary); }
  .listing-price span { font-size: 12px; font-weight: 400; color: var(--text-muted); }
  .listing-rating { display: flex; align-items: center; gap: 4px; font-size: 13px; }
  .listing-rating .star-icon { color: #F5A623; font-size: 13px; }
  .listing-rating b { font-weight: 700; }
  .listing-rating small { color: var(--text-muted); }

  /* Room type illustrative SVG */
  .room-svg { width: 80px; height: 80px; }

  /* ─── HOW IT WORKS ─── */
  .how-section {
    background: var(--text-primary);
    padding: 80px 2rem;
    color: #fff;
  }
  .how-inner { max-width: 1200px; margin: 0 auto; }
  .how-title { font-size: 34px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; color: #fff; }
  .how-title em { font-family: 'Instrument Serif', serif; font-style: italic; color: #7BA7FF; }
  .how-sub { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 52px; max-width: 480px; }
  .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .step-card {
    background: rgba(255,255,255,0.05); border-radius: var(--radius-lg);
    border: 1px solid rgba(255,255,255,0.08); padding: 24px;
    transition: all 0.2s;
  }
  .step-card:hover { background: rgba(255,255,255,0.08); }
  .step-num {
    font-size: 11px; font-weight: 700; color: var(--primary);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .step-num::before {
    content: ''; width: 24px; height: 2px; background: var(--primary); border-radius: 2px; display: block;
  }
  .step-icon {
    width: 44px; height: 44px; background: rgba(26,92,255,0.15);
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }
  .step-icon svg { width: 22px; height: 22px; stroke: #7BA7FF; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .step-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; color: #fff; }
  .step-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; }

  /* ─── FEATURES ─── */
  .features-section { max-width: 1200px; margin: 0 auto; padding: 80px 2rem; }
  .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .features-visual {
    background: var(--primary-light); border-radius: var(--radius-xl);
    padding: 32px; position: relative;
  }
  .feature-mockup {
    background: var(--surface); border-radius: var(--radius-lg);
    border: 1px solid var(--border); padding: 20px;
    box-shadow: var(--shadow-md);
  }
  .mockup-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .mockup-title { font-size: 15px; font-weight: 700; }
  .mockup-badge {
    font-size: 11px; font-weight: 700; padding: 4px 10px;
    border-radius: var(--radius-full); background: #EDFAF3; color: #0E7A4A;
  }
  .chat-messages { display: flex; flex-direction: column; gap: 10px; }
  .chat-msg { max-width: 75%; }
  .chat-msg.host { align-self: flex-start; }
  .chat-msg.guest { align-self: flex-end; }
  .msg-bubble {
    padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5;
  }
  .host .msg-bubble { background: var(--bg); color: var(--text-primary); border-bottom-left-radius: 4px; }
  .guest .msg-bubble { background: var(--primary); color: #fff; border-bottom-right-radius: 4px; }
  .msg-time { font-size: 10px; color: var(--text-muted); margin-top: 3px; padding: 0 4px; }
  .chat-input-row {
    display: flex; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border);
  }
  .chat-input-mock {
    flex: 1; background: var(--bg); border-radius: var(--radius-full);
    padding: 10px 16px; font-size: 13px; color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .chat-send {
    width: 36px; height: 36px; border-radius: 50%; background: var(--primary);
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .chat-send svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2.5; }

  .features-content .section-label {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--primary-light); color: var(--primary);
    font-size: 12px; font-weight: 700; padding: 5px 12px;
    border-radius: var(--radius-full); margin-bottom: 16px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .features-list { list-style: none; margin-top: 28px; }
  .feature-item {
    display: flex; gap: 14px; padding: 14px 0;
    border-bottom: 1px solid var(--border);
  }
  .feature-item:last-child { border-bottom: none; }
  .feature-icon-sm {
    width: 36px; height: 36px; flex-shrink: 0;
    background: var(--primary-light); border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .feature-icon-sm svg { width: 18px; height: 18px; stroke: var(--primary); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .feature-item-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
  .feature-item-desc { font-size: 13px; color: var(--text-secondary); }

  /* ─── TESTIMONIALS ─── */
  .testimonials-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem 80px; }
  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .testimonial-card {
    background: var(--surface); border-radius: var(--radius-lg);
    border: 1px solid var(--border); padding: 24px;
    transition: all 0.2s;
  }
  .testimonial-card:hover { box-shadow: var(--shadow-md); }
  .t-quote {
    font-size: 14px; line-height: 1.75; color: var(--text-secondary);
    margin-bottom: 20px; font-style: italic;
  }
  .t-author { display: flex; align-items: center; gap: 12px; }
  .t-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: #fff;
    flex-shrink: 0;
  }
  .av-blue { background: linear-gradient(135deg, #4072F0, #1A5CFF); }
  .av-green { background: linear-gradient(135deg, #34A55F, #0E7A4A); }
  .av-orange { background: linear-gradient(135deg, #FF7C4A, #CC4400); }
  .t-name { font-size: 14px; font-weight: 700; }
  .t-meta { font-size: 12px; color: var(--text-muted); }
  .t-stars { color: #F5A623; font-size: 13px; letter-spacing: 1px; margin-bottom: 14px; }

  /* ─── CTA ─── */
  .cta-section { padding: 80px 2rem; }
  .cta-inner {
    max-width: 1200px; margin: 0 auto;
    background: linear-gradient(135deg, #1A3FCC 0%, #1A5CFF 50%, #3B7FFF 100%);
    border-radius: 28px; padding: 64px; text-align: center;
    position: relative; overflow: hidden;
  }
  .cta-inner::before {
    content: ''; position: absolute;
    width: 400px; height: 400px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
    top: -120px; right: -120px;
  }
  .cta-inner::after {
    content: ''; position: absolute;
    width: 300px; height: 300px; border-radius: 50%;
    background: rgba(255,255,255,0.04);
    bottom: -80px; left: -80px;
  }
  .cta-label {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9);
    font-size: 12px; font-weight: 700; padding: 5px 14px;
    border-radius: var(--radius-full); margin-bottom: 20px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .cta-title { font-size: clamp(28px, 3.5vw, 44px); font-weight: 800; color: #fff; margin-bottom: 14px; letter-spacing: -1px; line-height: 1.15; }
  .cta-title em { font-family: 'Instrument Serif', serif; font-style: italic; }
  .cta-sub { font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 36px; }
  .cta-actions { display: flex; gap: 12px; justify-content: center; }
  .btn-cta-white {
    padding: 14px 32px; border-radius: var(--radius-full);
    border: none; background: #fff; color: var(--primary);
    font-family: var(--font); font-size: 15px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-cta-white:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.2); }
  .btn-cta-outline {
    padding: 14px 28px; border-radius: var(--radius-full);
    border: 1.5px solid rgba(255,255,255,0.35); background: transparent;
    color: #fff; font-family: var(--font); font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-cta-outline:hover { border-color: #fff; background: rgba(255,255,255,0.1); }

  /* ─── FOOTER ─── */
  footer {
    background: #0D1117; color: rgba(255,255,255,0.5);
    padding: 60px 2rem 32px;
  }
  .footer-inner { max-width: 1200px; margin: 0 auto; }
  .footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px; margin-bottom: 48px;
  }
  .footer-brand .logo { color: #fff; margin-bottom: 14px; }
  .footer-desc { font-size: 14px; line-height: 1.7; margin-bottom: 20px; }
  .footer-col-title { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-links a { font-size: 14px; color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: rgba(255,255,255,0.8); }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 24px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px;
  }

  /* ─── ANIMATIONS ─── */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .anim-delay-1 { animation: fadeInUp 0.6s 0.1s ease-out both; }
  .anim-delay-2 { animation: fadeInUp 0.6s 0.2s ease-out both; }
  .anim-delay-3 { animation: fadeInUp 0.6s 0.3s ease-out both; }
  .anim-delay-4 { animation: fadeInUp 0.6s 0.4s ease-out both; }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 1.5rem 40px; }
    .hero-visual { display: none; }
    .search-box { grid-template-columns: 1fr; gap: 12px; }
    .search-field { border-right: none; border-bottom: 1px solid var(--border); padding: 12px 0; }
    .search-action { padding: 0; }
    .listings-grid { grid-template-columns: 1fr 1fr; }
    .steps-grid { grid-template-columns: 1fr 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .features-grid { grid-template-columns: 1fr; }
    .testimonials-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .nav-links { display: none; }
    .listings-grid { grid-template-columns: 1fr; }
    .steps-grid { grid-template-columns: 1fr; }
    h1 { font-size: 32px; }
    .cta-inner { padding: 40px 24px; }
    .cta-actions { flex-direction: column; }
    .footer-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z"/></svg>
      </div>
      Tro<span class="logo-dot">Tốt</span>
    </a>
    <ul class="nav-links">
      <li><a href="#">Tìm phòng</a></li>
      <li><a href="#">Khu vực</a></li>
      <li><a href="#">Giá cả</a></li>
      <li><a href="#">Đăng tin</a></li>
    </ul>
    <div class="nav-actions">
      <button class="btn-ghost">Đăng nhập</button>
      <button class="btn-primary">Đăng ký miễn phí</button>
    </div>
  </div>
</nav>

<!-- HERO -->
<section>
  <div class="hero">
    <!-- Left -->
    <div class="anim-delay-1">
      <div class="hero-label">
        <span></span> Nền tảng tìm trọ #1 Việt Nam
      </div>
      <h1>Tìm phòng trọ <em>ưng ý</em> trong vài phút</h1>
      <p class="hero-sub">Hàng nghìn phòng trọ, căn hộ dịch vụ tại TP.HCM và các tỉnh lớn. Xem thực tế, chat trực tiếp với chủ trọ — nhanh, an toàn, tiết kiệm.</p>
      <div class="hero-cta">
        <button class="btn-hero">Tìm phòng ngay</button>
        <button class="btn-secondary-hero">Đăng tin cho thuê</button>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-num">12.400+</div>
          <div class="stat-label">Phòng đang cho thuê</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">98%</div>
          <div class="stat-label">Khách hàng hài lòng</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">500+</div>
          <div class="stat-label">Chủ trọ uy tín</div>
        </div>
      </div>
    </div>

    <!-- Right visual -->
    <div class="hero-visual anim-delay-2">
      <div class="float-badge float-badge-1">
        <div class="badge-icon">
          <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.79a19.79 19.79 0 01-3.07-8.67A2 2 0 011.94 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        </div>
        <div>
          <div class="badge-text">Chat trực tiếp</div>
          <div class="badge-sub">Nhắn tin realtime</div>
        </div>
      </div>
      <div class="hero-card-main">
        <div class="hero-card-img">
          <div class="hero-card-img-inner">
            <svg class="room-svg-preview" viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="40" width="120" height="80" rx="4" fill="rgba(255,255,255,0.12)"/>
              <rect x="30" y="60" width="40" height="30" rx="3" fill="rgba(255,255,255,0.2)"/>
              <rect x="80" y="70" width="50" height="20" rx="3" fill="rgba(255,255,255,0.15)"/>
              <rect x="160" y="60" width="80" height="60" rx="4" fill="rgba(255,255,255,0.1)"/>
              <rect x="170" y="80" width="30" height="25" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="210" y="85" width="25" height="20" rx="2" fill="rgba(255,255,255,0.15)"/>
              <rect x="260" y="50" width="110" height="70" rx="4" fill="rgba(255,255,255,0.12)"/>
              <rect x="270" y="65" width="90" height="40" rx="3" fill="rgba(255,255,255,0.18)"/>
              <line x1="0" y1="140" x2="400" y2="140" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
              <rect x="0" y="140" width="400" height="20" fill="rgba(0,0,0,0.15)"/>
            </svg>
          </div>
        </div>
        <div class="hero-card-body">
          <div class="card-location">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
            Quận 3, TP.HCM
          </div>
          <div class="card-title">Căn hộ Studio sạch sẽ, đủ nội thất</div>
          <div class="card-row">
            <div class="card-price">3.500.000 <span>đ/tháng</span></div>
            <div class="card-rating">
              <span class="stars">★★★★★</span>
              <strong>4.9</strong>
            </div>
          </div>
          <div class="card-tags">
            <span class="tag">Wifi tốc độ cao</span>
            <span class="tag green">Còn trống</span>
            <span class="tag orange">Điều hoà</span>
          </div>
        </div>
      </div>
      <div class="float-badge float-badge-2">
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Mới nhất hôm nay</div>
        <div style="font-size: 18px; font-weight: 800; color: var(--text-primary);">+148 tin đăng</div>
      </div>
    </div>
  </div>
</section>

<!-- SEARCH -->
<section class="search-section">
  <div class="search-box">
    <div class="search-field">
      <label>Địa điểm</label>
      <input type="text" placeholder="Quận, phường, đường..."/>
    </div>
    <div class="search-field">
      <label>Loại phòng</label>
      <select>
        <option>Tất cả loại</option>
        <option>Phòng trọ</option>
        <option>Căn hộ dịch vụ</option>
        <option>Nhà nguyên căn</option>
      </select>
    </div>
    <div class="search-field">
      <label>Khoảng giá</label>
      <select>
        <option>Mọi giá</option>
        <option>Dưới 2 triệu</option>
        <option>2 – 4 triệu</option>
        <option>4 – 7 triệu</option>
        <option>Trên 7 triệu</option>
      </select>
    </div>
    <div class="search-action">
      <button class="btn-search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Tìm kiếm
      </button>
    </div>
  </div>
  <div class="quick-filters">
    <button class="filter-chip active">Tất cả</button>
    <button class="filter-chip">Quận 1</button>
    <button class="filter-chip">Quận 3</button>
    <button class="filter-chip">Quận 7</button>
    <button class="filter-chip">Bình Thạnh</button>
    <button class="filter-chip">Gò Vấp</button>
    <button class="filter-chip">Thủ Đức</button>
    <button class="filter-chip">Bình Dương</button>
  </div>
</section>

<!-- LISTINGS -->
<section class="section">
  <div class="section-header">
    <h2 class="section-title">Phòng <em>nổi bật</em> hôm nay</h2>
    <a href="#" class="section-link">Xem tất cả →</a>
  </div>
  <div class="listings-grid">

    <!-- Card 1 -->
    <div class="listing-card">
      <div class="listing-img">
        <div class="listing-img-bg img-1">
          <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="80">
            <rect x="10" y="20" width="80" height="50" rx="4" fill="#C7D9FF"/>
            <rect x="20" y="30" width="25" height="20" rx="3" fill="#A0BCFF"/>
            <rect x="55" y="35" width="25" height="15" rx="3" fill="#A0BCFF"/>
            <rect x="40" y="50" width="20" height="20" rx="2" fill="#7BA7FF"/>
          </svg>
        </div>
        <button class="listing-fav">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
        <span class="listing-badge badge-new">Mới đăng</span>
      </div>
      <div class="listing-body">
        <div class="listing-location">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Quận 3, TP.HCM
        </div>
        <div class="listing-title">Phòng trọ cao cấp, full nội thất, ban công riêng</div>
        <div class="listing-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            25 m²
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M2 20h20M4 20V8l8-6 8 6v12"/></svg>
            1 phòng
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Wifi
          </span>
        </div>
        <div class="listing-footer">
          <div class="listing-price">3.500.000 <span>đ/tháng</span></div>
          <div class="listing-rating">
            <span class="star-icon">★</span>
            <b>4.9</b>
            <small>(24)</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="listing-card">
      <div class="listing-img">
        <div class="listing-img-bg img-3">
          <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="80">
            <rect x="15" y="15" width="70" height="55" rx="5" fill="#C6F6D5"/>
            <rect x="25" y="28" width="20" height="18" rx="3" fill="#9AE6B4"/>
            <rect x="55" y="32" width="18" height="14" rx="3" fill="#9AE6B4"/>
            <rect x="38" y="50" width="25" height="20" rx="2" fill="#68D391"/>
          </svg>
        </div>
        <button class="listing-fav liked">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
        <span class="listing-badge badge-hot">Hot</span>
      </div>
      <div class="listing-body">
        <div class="listing-location">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Bình Thạnh, TP.HCM
        </div>
        <div class="listing-title">Căn hộ mini 1PN gần Vincom, view đẹp tầng cao</div>
        <div class="listing-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            35 m²
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M2 20h20M4 20V8l8-6 8 6v12"/></svg>
            2 phòng
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            Bãi xe
          </span>
        </div>
        <div class="listing-footer">
          <div class="listing-price">5.200.000 <span>đ/tháng</span></div>
          <div class="listing-rating">
            <span class="star-icon">★</span>
            <b>4.7</b>
            <small>(18)</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="listing-card">
      <div class="listing-img">
        <div class="listing-img-bg img-4">
          <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="80">
            <rect x="12" y="18" width="76" height="52" rx="4" fill="#FDE68A"/>
            <rect x="22" y="28" width="22" height="18" rx="3" fill="#FCD34D"/>
            <rect x="52" y="33" width="22" height="13" rx="3" fill="#FCD34D"/>
            <rect x="35" y="50" width="28" height="20" rx="2" fill="#F59E0B"/>
          </svg>
        </div>
        <button class="listing-fav">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>
      <div class="listing-body">
        <div class="listing-location">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Quận 7, TP.HCM
        </div>
        <div class="listing-title">Phòng trọ rộng rãi gần RMIT, an ninh tốt</div>
        <div class="listing-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            20 m²
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M2 20h20M4 20V8l8-6 8 6v12"/></svg>
            1 phòng
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Điều hoà
          </span>
        </div>
        <div class="listing-footer">
          <div class="listing-price">2.800.000 <span>đ/tháng</span></div>
          <div class="listing-rating">
            <span class="star-icon">★</span>
            <b>4.8</b>
            <small>(31)</small>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how-section">
  <div class="how-inner">
    <div class="how-title">Tìm phòng <em>chưa bao giờ</em> dễ đến vậy</div>
    <p class="how-sub">Quy trình đơn giản, minh bạch — từ tìm kiếm đến dọn vào ở chỉ trong vài ngày.</p>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-num">Bước 01</div>
        <div class="step-icon">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div class="step-title">Tìm kiếm & lọc</div>
        <p class="step-desc">Nhập khu vực, mức giá, tiện ích mong muốn. Bộ lọc thông minh giúp thu hẹp kết quả chính xác.</p>
      </div>
      <div class="step-card">
        <div class="step-num">Bước 02</div>
        <div class="step-icon">
          <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div class="step-title">Xem chi tiết</div>
        <p class="step-desc">Hình ảnh thực tế, bản đồ vị trí, đánh giá từ khách ở trước — đầy đủ thông tin trước khi liên hệ.</p>
      </div>
      <div class="step-card">
        <div class="step-num">Bước 03</div>
        <div class="step-icon">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <div class="step-title">Chat với chủ trọ</div>
        <p class="step-desc">Nhắn tin trực tiếp, hỏi đáp nhanh, đặt lịch hẹn xem phòng ngay trong ứng dụng.</p>
      </div>
      <div class="step-card">
        <div class="step-num">Bước 04</div>
        <div class="step-icon">
          <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="step-title">Dọn vào ở</div>
        <p class="step-desc">Ký hợp đồng, nhận chìa khoá. Để lại đánh giá giúp cộng đồng thuê trọ an toàn hơn.</p>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features-section">
  <div class="features-grid">
    <div class="features-visual">
      <div class="feature-mockup">
        <div class="mockup-header">
          <div class="mockup-title">Tin nhắn với chủ trọ</div>
          <span class="mockup-badge">Online</span>
        </div>
        <div class="chat-messages">
          <div class="chat-msg host">
            <div class="msg-bubble">Chào bạn, phòng vẫn còn trống. Bạn muốn đặt lịch xem không?</div>
            <div class="msg-time">10:32</div>
          </div>
          <div class="chat-msg guest">
            <div class="msg-bubble">Vâng, anh ơi! Cho em hỏi phòng có điều hoà chưa ạ?</div>
            <div class="msg-time">10:34</div>
          </div>
          <div class="chat-msg host">
            <div class="msg-bubble">Có rồi em, điều hoà inverter mới lắp tháng trước nhé. Giá điện tính theo số.</div>
            <div class="msg-time">10:35</div>
          </div>
          <div class="chat-msg guest">
            <div class="msg-bubble">Em muốn xem thứ 7 này được không ạ?</div>
            <div class="msg-time">10:36</div>
          </div>
        </div>
        <div class="chat-input-row">
          <div class="chat-input-mock">Nhắn tin...</div>
          <button class="chat-send">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="features-content">
      <span class="section-label">Tính năng nổi bật</span>
      <h2 class="section-title">Kết nối <em>trực tiếp</em><br>không qua trung gian</h2>
      <ul class="features-list">
        <li class="feature-item">
          <div class="feature-icon-sm">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div>
            <div class="feature-item-title">Chat realtime với chủ trọ</div>
            <div class="feature-item-desc">Nhắn tin trực tiếp, không cần chia sẻ số điện thoại cá nhân, an toàn và tiện lợi.</div>
          </div>
        </li>
        <li class="feature-item">
          <div class="feature-icon-sm">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div class="feature-item-title">Đặt lịch hẹn xem phòng</div>
            <div class="feature-item-desc">Chọn ngày giờ phù hợp, chủ trọ xác nhận lịch ngay trên ứng dụng, có nhắc hẹn tự động.</div>
          </div>
        </li>
        <li class="feature-item">
          <div class="feature-icon-sm">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div>
            <div class="feature-item-title">Đánh giá minh bạch từ cộng đồng</div>
            <div class="feature-item-desc">Xếp hạng sao và nhận xét thực từ người đã thuê, giúp bạn chọn phòng chính xác hơn.</div>
          </div>
        </li>
        <li class="feature-item">
          <div class="feature-icon-sm">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <div>
            <div class="feature-item-title">Lưu danh sách yêu thích</div>
            <div class="feature-item-desc">Lưu phòng ưng ý để so sánh sau, nhận thông báo khi phòng có thay đổi giá hoặc tình trạng.</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="testimonials-section">
  <div class="section-header">
    <h2 class="section-title">Khách hàng nói gì về <em>TroTốt</em></h2>
  </div>
  <div class="testimonials-grid">
    <div class="testimonial-card">
      <div class="t-stars">★★★★★</div>
      <p class="t-quote">"Tìm được phòng ưng ý chỉ sau 2 ngày. Chat với chủ trọ rất nhanh, lịch hẹn xem phòng được duyệt trong vòng 1 tiếng. Trải nghiệm tốt hơn tôi nghĩ nhiều."</p>
      <div class="t-author">
        <div class="t-avatar av-blue">MH</div>
        <div>
          <div class="t-name">Minh Hùng</div>
          <div class="t-meta">Sinh viên năm 3, Quận 7</div>
        </div>
      </div>
    </div>
    <div class="testimonial-card">
      <div class="t-stars">★★★★★</div>
      <p class="t-quote">"Giao diện thân thiện, tìm kiếm nhanh và kết quả chính xác. Tính năng lọc theo giá rất hữu ích, giúp mình không mất thời gian xem những phòng không phù hợp túi tiền."</p>
      <div class="t-author">
        <div class="t-avatar av-green">TL</div>
        <div>
          <div class="t-name">Thanh Lan</div>
          <div class="t-meta">Nhân viên văn phòng, Bình Thạnh</div>
        </div>
      </div>
    </div>
    <div class="testimonial-card">
      <div class="t-stars">★★★★☆</div>
      <p class="t-quote">"Đánh giá từ người thuê trước rất thật và hữu ích. Mình đã tránh được 2 phòng trọ kém chất lượng nhờ đọc review trước khi đặt lịch. Tiết kiệm được nhiều thời gian."</p>
      <div class="t-author">
        <div class="t-avatar av-orange">QA</div>
        <div>
          <div class="t-name">Quốc Anh</div>
          <div class="t-meta">Kỹ sư phần mềm, Thủ Đức</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="cta-inner">
    <div class="cta-label">Miễn phí hoàn toàn</div>
    <h2 class="cta-title">Sẵn sàng tìm<br><em>ngôi nhà mới</em> của bạn?</h2>
    <p class="cta-sub">Đăng ký miễn phí ngay hôm nay, khám phá hàng nghìn phòng trọ uy tín toàn quốc.</p>
    <div class="cta-actions">
      <button class="btn-cta-white">Tìm phòng ngay</button>
      <button class="btn-cta-outline">Đăng tin cho thuê</button>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z"/></svg>
          </div>
          Tro<span class="logo-dot">Tốt</span>
        </a>
        <p class="footer-desc" style="margin-top: 14px;">Nền tảng kết nối người tìm phòng và chủ trọ uy tín, nhanh chóng, an toàn trên toàn Việt Nam.</p>
        <div style="font-size: 13px;">© 2025 TroTốt. All rights reserved.</div>
      </div>
      <div>
        <div class="footer-col-title">Khám phá</div>
        <ul class="footer-links">
          <li><a href="#">Tìm phòng</a></li>
          <li><a href="#">Phòng nổi bật</a></li>
          <li><a href="#">Bản đồ phòng trọ</a></li>
          <li><a href="#">Phòng mới nhất</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Hỗ trợ</div>
        <ul class="footer-links">
          <li><a href="#">Hướng dẫn thuê phòng</a></li>
          <li><a href="#">Hướng dẫn đăng tin</a></li>
          <li><a href="#">Chính sách bảo mật</a></li>
          <li><a href="#">Điều khoản sử dụng</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Liên hệ</div>
        <ul class="footer-links">
          <li><a href="#">Trung tâm hỗ trợ</a></li>
          <li><a href="#">Báo cáo vi phạm</a></li>
          <li><a href="#">Hợp tác doanh nghiệp</a></li>
          <li><a href="#">Blog & Tin tức</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>Được xây dựng với ♥ tại TP.HCM, Việt Nam</span>
      <span>TP.HCM · Hà Nội · Đà Nẵng · Cần Thơ</span>
    </div>
  </div>
</footer>

<script>
  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Favourite toggle
  document.querySelectorAll('.listing-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('liked');
    });
  });

  // Search input placeholder animation
  const placeholders = ['Quận 3, TP.HCM', 'Bình Thạnh...', 'Đường Nguyễn Trãi...', 'Quận 7, gần RMIT...'];
  const input = document.querySelector('.search-field input');
  let pi = 0;
  setInterval(() => {
    pi = (pi + 1) % placeholders.length;
    input.setAttribute('placeholder', placeholders[pi]);
  }, 2500);
</script>
</body>
</html>