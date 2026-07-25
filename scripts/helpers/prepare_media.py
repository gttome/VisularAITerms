#!/usr/bin/env python3
import argparse, html, os, sys, zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS={'w':W}

def image_mode(src, web, thumb):
    try:
        from PIL import Image
    except Exception as exc:
        raise RuntimeError('Pillow is required for non-Windows image preparation') from exc
    def save_resized(target, max_w, max_h):
        with Image.open(src) as im:
            im=im.convert('RGB')
            im.thumbnail((max_w,max_h), Image.Resampling.LANCZOS)
            Path(target).parent.mkdir(parents=True,exist_ok=True)
            im.save(target,'JPEG',quality=84,optimize=True)
    save_resized(web,1600,1600)
    save_resized(thumb,480,320)

def para_html(p, title):
    texts=[t.text or '' for t in p.findall('.//w:t',NS)]
    text=''.join(texts).strip()
    if not text: return None,None
    safe=html.escape(text)
    if title.lower() in text.lower() and (text[0].isdigit() or '#1' in text):
        return 'block',f'<h2>{html.escape(title)}</h2>'
    prefixes=[
        'Plain-language definition:',
        'Why it matters to senior leaders:',
        'Why it matters to knowledge workers:',
        'Practical organizational example:',
        'Key opportunities:',
        'Principal risks or limitations:',
        'Common misconception:',
        'What to monitor next:'
    ]
    for prefix in prefixes:
        if text.lower().startswith(prefix.lower()):
            rest=text[len(prefix):].strip()
            return 'block',f'<h3>{html.escape(prefix[:-1])}</h3><p>{html.escape(rest)}</p>'
    style=p.find('./w:pPr/w:pStyle',NS)
    style_val=style.get(f'{{{W}}}val','') if style is not None else ''
    num=p.find('./w:pPr/w:numPr',NS)
    if style_val.lower().startswith('heading'):
        digits=''.join(ch for ch in style_val if ch.isdigit())
        level=max(2,min(4,int(digits or '2')))
        return 'block',f'<h{level}>{safe}</h{level}>'
    if num is not None:return 'list',f'<li>{safe}</li>'
    return 'block',f'<p>{safe}</p>'

def table_html(tbl):
    rows=[]
    for tr in tbl.findall('./w:tr',NS):
        cells=[]
        for tc in tr.findall('./w:tc',NS):
            text=' '.join(''.join(t.text or '' for t in p.findall('.//w:t',NS)).strip() for p in tc.findall('.//w:p',NS)).strip()
            cells.append(f'<td>{html.escape(text)}</td>')
        if cells: rows.append('<tr>'+''.join(cells)+'</tr>')
    return '<table><tbody>'+''.join(rows)+'</tbody></table>' if rows else ''

def docx_mode(src, output, title):
    with zipfile.ZipFile(src) as z:
        xml=z.read('word/document.xml')
    root=ET.fromstring(xml)
    body=root.find('.//w:body',NS)
    chunks=[];in_list=False
    for child in list(body):
        local=child.tag.rsplit('}',1)[-1]
        if local=='p':
            kind,markup=para_html(child,title)
            if not markup: continue
            if kind=='list':
                if not in_list: chunks.append('<ul>');in_list=True
                chunks.append(markup)
            else:
                if in_list:chunks.append('</ul>');in_list=False
                chunks.append(markup)
        elif local=='tbl':
            if in_list:chunks.append('</ul>');in_list=False
            markup=table_html(child)
            if markup:chunks.append(markup)
    if in_list:chunks.append('</ul>')
    safe_title=html.escape(title)
    doc=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{safe_title} - Briefing</title></head><body><article class="briefing-document">'+''.join(chunks)+'</article></body></html>'
    Path(output).parent.mkdir(parents=True,exist_ok=True);Path(output).write_text(doc,encoding='utf-8')

def main():
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['image','docx']);p.add_argument('--src',required=True);p.add_argument('--web');p.add_argument('--thumb');p.add_argument('--out');p.add_argument('--title',default='Concept briefing');a=p.parse_args()
    if a.mode=='image':
        if not a.web or not a.thumb:p.error('--web and --thumb required')
        image_mode(a.src,a.web,a.thumb)
    else:
        if not a.out:p.error('--out required')
        docx_mode(a.src,a.out,a.title)
if __name__=='__main__':
    try:main()
    except Exception as exc:print(f'ERROR: {exc}',file=sys.stderr);sys.exit(1)
