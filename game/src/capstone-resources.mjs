import {cedarSources,cedarCases} from './capstone-lab.mjs';
export const cedarBuildScript=`#!/usr/bin/env python3
"""Rebuild the player's Cedar reports from local source data and selected procedure."""
import csv,json,pathlib
root=pathlib.Path(__file__).resolve().parent
rows=list(csv.DictReader((root/'current.csv').open(newline='')))
procedure=json.loads((root/'procedure.json').read_text())['revenue_formula']
for previous,current in zip(rows,rows[1:]):
    p=float(previous['billed']); c=float(current['billed'])
    growth=12 if procedure=='template' else (c-p)/(c if procedure=='current' else p)*100
    metrics={'week':current['week'],'completed':int(current['completed']),'completion_rate':round(int(current['completed'])/int(current['started'])*100,2),'revenue_change':round(growth,2),'approval_owner':'Leah Morgan'}
    folder=root/'reports'/current['week'];folder.mkdir(parents=True,exist_ok=True)
    with (folder/'metrics.csv').open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=metrics);writer.writeheader();writer.writerow(metrics)
    (folder/'cedar-weekly.md').write_text(f"# Cedar Research — {metrics['week']}\\n\\nApproval owner: {metrics['approval_owner']}\\nCompleted onboardings: {metrics['completed']}\\nCompletion rate: {metrics['completion_rate']:.2f}%\\nBilled-revenue change vs previous week: {metrics['revenue_change']:.2f}%\\n\\nSource: current.csv. Fictional training data.\\n")
    print('WROTE',folder.relative_to(root))
`;
export const cedarCheckScript=`#!/usr/bin/env python3
"""Independently inspect the actual saved CSV and Markdown against current source rows."""
import csv,pathlib,sys
from decimal import Decimal,ROUND_HALF_UP
root=pathlib.Path(__file__).resolve().parent
try:
    sources=list(csv.DictReader((root/'current.csv').open(newline='')))
    assert len(sources)>=2,'At least two source periods are required'
    errors=[]
    for p,c in zip(sources,sources[1:]):
        period=c['week'];folder=root/'reports'/period
        with (folder/'metrics.csv').open(newline='') as f:
            reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
        required=['week','completed','completion_rate','revenue_change','approval_owner']
        assert fields==required,f'{period}: column order/names differ'
        assert len(rows)==1 and None not in rows[0],f'{period}: expected one complete record'
        saved=rows[0];pct=lambda n,d:(Decimal(n)/Decimal(d)*100).quantize(Decimal('0.01'),rounding=ROUND_HALF_UP)
        completion=pct(c['completed'],c['started']);growth=pct(Decimal(c['billed'])-Decimal(p['billed']),p['billed'])
        expected={'week':period,'completed':c['completed'],'completion_rate':completion,'revenue_change':growth,'approval_owner':'Leah Morgan'}
        for key,value in expected.items():
            actual=Decimal(saved[key]) if key in ['completion_rate','revenue_change'] else saved[key]
            if actual!=value:errors.append(f'{period}: {key}: expected {value}, found {actual}')
        report=(folder/'cedar-weekly.md').read_text()
        expected_report=f"# Cedar Research — {period}\\n\\nApproval owner: Leah Morgan\\nCompleted onboardings: {c['completed']}\\nCompletion rate: {completion:.2f}%\\nBilled-revenue change vs previous week: {growth:.2f}%\\n\\nSource: current.csv. Fictional training data.\\n"
        if report!=expected_report:errors.append(f'{period}: saved Markdown differs from source-derived report')
    if errors:print('CHECK FAILED\\n'+'\\n'.join(errors));sys.exit(1)
    print(f'CHECK PASSED: {len(sources)-1} saved reporting periods match independent source calculations.')
except (OSError,ValueError,KeyError,AssertionError,ArithmeticError) as error:
    print('CHECK FAILED:',error);sys.exit(1)
`;
export function capstoneFiles(r){const prefix='cedar-capstone/';const result={};
 for(const f of cedarSources.filter(x=>['brief','current','instructions'].includes(x.id)))result[prefix+f.name]=f.text+'\n';
 for(const [key,o] of Object.entries(r.outputs))for(const [name,text] of Object.entries(o.files))result[prefix+'reports/'+cedarCases[key][1].week+'/'+name]=text;
 result[prefix+'procedure.json']=JSON.stringify({revenue_formula:r.actions.filter(a=>a.action==='procedure').at(-1)?.value??'template',completion_formula:'completed / started * 100',rounding:'two decimal places',simulation:true},null,2)+'\n';
 result[prefix+'build_reports.py']=cedarBuildScript;result[prefix+'check_reports.py']=cedarCheckScript;
 result[prefix+'MY-TASK.md']='# '+(r.definition.title||'Cedar reporting attempt')+'\n\n'+r.definition.summary+'\n\nStructured definition:\n'+JSON.stringify(r.definition,null,2)+'\n';
 result[prefix+'REVIEW.json']=JSON.stringify(r,null,2)+'\n';
 result[prefix+'SCHEDULE.md']=r.rehearsal?`# Proposed Cedar follow-up\n\nSchedule: ${r.rehearsal.schedule.cadence}; timezone ${r.rehearsal.schedule.timezone}. Local execution requirement: ${r.rehearsal.schedule.runtime}. Notification policy: ${r.rehearsal.schedule.alerts}. Source failure policy: ${r.rehearsal.schedule.failure}.\n\nRead the current approved source and applicable project instructions. Build the report and CSV, run the independent check, then read the actual files. Use the same project. On changed results, provide the new report and verification; on read failure, report the failure and preserve the last successful artifact. Stay quiet on unchanged successful results.\n\nThis is an editable request, not an installed automation. The local host and source access must remain available. Verify the model, tools, timezone and scheduling behavior in your Codex app.\n`:'# No tested follow-up yet\nThis attempt has not produced a recurring rehearsal.\n';
 result[prefix+'README.md']=`# Cedar Research capstone\n\nThese are actual files from a fictional practice task. Current handoff: ${r.passed?'verified in the game':'still in progress'}. First submission: ${r.first?r.first.scores.filter(Boolean).length+'/5 dimensions'+(r.first.assisted?' (used a hint)':''):'not submitted'}. Free prose is retained for human review, not semantically graded.\n\n1. Inspect CLIENT-BRIEF.md, AGENTS.md and current.csv.\n2. Run \`python3 check_reports.py\` here to independently check the saved Markdown and CSV against the source. An incomplete or incorrect attempt should fail.\n3. Preserve a copy before editing. \`python3 build_reports.py\` rebuilds reports using your selected procedure.json. Run the independent check again.\n4. Add a fresh source period to test transfer beyond the game fixtures. A copied percentage cannot generalize.\n5. Read MY-TASK.md, SCHEDULE.md and REVIEW.json for your actual definition, proposed follow-up, first result, retries, hint use and synthetic run evidence.\n\nThe scripts need Python 3 only. They use no API, credentials or network. No real Codex task, model call, automation, notification or public site was created. Real client requirements, source ownership, host availability and operational monitoring require their own verification.\n`;
 return result;
}
