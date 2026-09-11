from pathlib import Path
import re,json,hashlib,html
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor,white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from PIL import Image
R=Path(__file__).resolve().parents[1]
font=R/'filming-site/dist/assets'
pdfmetrics.registerFont(TTFont('Body',str(font/'body.ttf')))
pdfmetrics.registerFont(TTFont('Display',str(font/'display.ttf')))
md=(R/'production/FILMING-GUIDE.md').read_text()
sections=re.split(r'^## (.+?) \((\d\d:\d\d)-(\d\d:\d\d)\)\s*$',md,flags=re.M)
scenes=[]
for i in range(1,len(sections),4):
 title,start,end,body=sections[i:i+4]
 fields={}
 for match in re.finditer(r'^\*\*([^*]+):\*\*\s*([\s\S]*?)(?=^\*\*[^*]+:\*\*|\Z)',body,re.M):
  fields[match[1]]=match[2].split('\n---\n')[0].strip()
 text=fields.get('Say','')
 scenes.append(dict(title=title,start=start,end=end,fields=fields,words=len(text.split())))
assert len(scenes)==26
cards=json.loads((R/'production/FILMING-PROMPT-CARDS.json').read_text())
# A landscape guide uses the same layout on each filming page: picture left, exact speech right.
W,H=1000,750
pdf=R/'output/pdf/IMMERSIVE-LEARNING-WORLDS-FILMING-GUIDE.pdf'
c=Canvas(str(pdf),pagesize=(W,H));c.setTitle('Build 3D Worlds to Learn Anything - Filming Guide');c.setAuthor('Mark Kashef')
styles={
 'say':ParagraphStyle('say',fontName='Body',fontSize=14.1,leading=19.3,textColor=HexColor('#151a30'),spaceAfter=12),
 'note':ParagraphStyle('note',fontName='Body',fontSize=10.7,leading=14.6,textColor=HexColor('#46516c')),
 'small':ParagraphStyle('small',fontName='Body',fontSize=10,leading=13,textColor=HexColor('#66708a')),
 'white':ParagraphStyle('white',fontName='Body',fontSize=20,leading=29,textColor=white),
}
def clean(t):return re.sub(r'\*\*([^*]+)\*\*',r'\1',t).replace('→',' > ').replace('↗','').replace('·',' / ').replace('–','-').replace('—','-')
def para(text,x,y,width,style='note'):
 p=Paragraph(html.escape(clean(text)).replace('\n','<br/>'),styles[style]);_,h=p.wrap(width,H);p.drawOn(c,x,y-h);return y-h

def label(text,x,y):
 c.setFillColor(HexColor('#5730d9'));c.setFont('Display',10);c.drawString(x,y,text.upper());return y-14

def footer(n):
 c.setStrokeColor(HexColor('#d5d9e3'));c.line(38,37,W-38,37);c.setFont('Body',9);c.setFillColor(HexColor('#69718a'));c.drawString(38,22,'MARK KASHEF / FILMING GUIDE / SEPTEMBER 2026');c.drawRightString(W-38,22,f'{n:02}')
# Cover
c.setFillColor(HexColor('#0c1021'));c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(HexColor('#81f2d3'));c.setFont('Display',14);c.drawString(50,695,'MARK KASHEF')
c.setFillColor(white);c.setFont('Display',43)
for j,line in enumerate(['You Can Now Build','3D Worlds to Learn Anything']):c.drawString(50,620-j*58,line)
c.drawImage(str(R/'filming-site/dist/assets/world.png'),50,195,width=510,height=319,mask='auto')
y=490
y=para('Idea > Plan > Build > Host',610,y,335,'white')-25
y=para('26 filming scenes\nRequests > Plan > Review\nAbout 17 minutes',610,y,330,'white')-28
y=para('Read the Say blocks.\nUse the picture and notes to set up each shot.',610,y,330,'white')
c.setFillColor(HexColor('#a8b3d0'));c.setFont('Body',11);c.drawString(50,135,'Controls: scroll to navigate / H hide controls / Scenes to jump / All content appears immediately')
c.drawString(50,108,'Final pickups: current plugin cards, community source entry and public second-link destination.')
c.drawString(50,75,'Open the filming site: immersive-learning-worlds.markkashef.chatgpt.site')
c.linkURL('https://immersive-learning-worlds.markkashef.chatgpt.site',(50,69,630,91),relative=0)
c.showPage()
used=[];layout=[]
for idx,s in enumerate(scenes):
 title=s['title'];fields=s['fields'];sceneid='overview'
 m=re.search(r'Plan (\d\d)',title)
 if m:sceneid='plan-'+m.group(1)
 elif title=='Turn the idea into a plan':sceneid='plan-01'
 elif 'effort' in title:sceneid='build'
 elif 'Publish' in title:sceneid='host'
 elif 'beyond' in title:sceneid='possibilities'
 elif 'deeper' in title:sceneid='resources'
 elif 'Click through' in title:sceneid=None
 shot=R/'evidence/filming-site'/f'1440-{sceneid}-18000.png' if sceneid else R/'filming-site/dist/assets/mission.png'
 c.setFillColor(HexColor('#f8f9fc'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.bookmarkPage(f'scene-{idx+1}');c.addOutlineEntry(f'{idx+1:02} {title}',f'scene-{idx+1}',level=0)
 c.setFillColor(HexColor('#171b34'));c.setFont('Display',23);c.drawString(38,704,clean(title))
 c.setFillColor(HexColor('#69718a'));c.setFont('Body',12);c.drawRightString(960,707,f"{s['start']} - {s['end']}")
 c.setStrokeColor(HexColor('#d5d9e3'));c.line(38,688,962,688)
 # left visual followed by production cues
 if title in cards:
  card=cards[title];dh=278
  c.setFillColor(HexColor('#e4f8f2'));c.roundRect(38,664-dh,444,dh,8,fill=1,stroke=0)
  cy=label(card['label'],58,640)
  cardstyle=ParagraphStyle('card',parent=styles['note'],fontSize=14,leading=19,textColor=HexColor('#171b34'))
  cp=Paragraph(html.escape(card['quote']).replace('\n','<br/>'),cardstyle);_,ch=cp.wrap(404,240);cp.drawOn(c,58,cy-ch)
  assert ch<225,(title,'quote card overflow',ch)
  y=647-dh
 else:
  im=Image.open(shot);iw,ih=im.size;scale=min(444/iw,278/ih);dw=iw*scale;dh=ih*scale
  c.drawImage(str(shot),38+(444-dw)/2,664-dh,width=dw,height=dh,mask='auto');y=647-dh
 y=label('Picture',38,y);y=para(fields.get('Picture',''),38,y,444)-17
 y=label('On-screen copy',38,y);y=para(fields.get('On-screen copy',''),38,y,444)-17
 y=label('Editing note',38,y);y=para(fields.get('Editing note',''),38,y,444)-17
 y=label('Source / truth',38,y);y=para(fields.get('Source or truth card',''),38,y,444,'small')
 # right exact spoken text
 ry=label('Say',520,661)
 for p in fields.get('Say','').split('\n\n'):
  ry=para(p,520,ry,442,'say')-14
 if fields.get('Re-hook'):
  ry=label('Re-hook',520,ry-4);ry=para(fields['Re-hook'],520,ry,442,'say')
 layout.append({'scene':title,'left_bottom':round(y,1),'speech_bottom':round(ry,1)})
 assert y>47,(title,'notes overflow',y)
 assert ry>47,(title,'speech overflow',ry)
 footer(idx+2);c.showPage()
c.save()
# Generate downstream script and timing only after PDF.
spoken='\n\n'.join(' '.join(s['fields']['Say'].split()) for s in scenes)+'\n'
(R/'output/audio/narration-source.txt').write_text(spoken)
def secs(v):a,b=map(int,v.split(':'));return a*60+b
wordcount=sum(s['words'] for s in scenes)
rows=['# Spoken timing report','',f'{wordcount} words. {wordcount/155:.2f} minutes at 155 WPM. Planned guide: 16:56 including navigation. No TTS audio generated.','', '| Scene | Words | Seconds | WPM |','| --- | ---: | ---: | ---: |']
for s in scenes:
 duration=secs(s['end'])-secs(s['start']);rows.append(f"| {s['title']} | {s['words']} | {duration} | {round(s['words']/duration*60)} |")
(R/'production/TIMING-REPORT.md').write_text('\n'.join(rows)+'\n')
(R/'evidence/filming-site/pdf-layout.json').write_text(json.dumps({'pages':len(scenes)+1,'words':wordcount,'guide_sha256':hashlib.sha256(md.encode()).hexdigest(),'layout':layout},indent=2))
print(json.dumps({'pdf':str(pdf),'pages':len(scenes)+1,'words':wordcount,'min_notes_bottom':min(x['left_bottom'] for x in layout),'min_speech_bottom':min(x['speech_bottom'] for x in layout)}))
