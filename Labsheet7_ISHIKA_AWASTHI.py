# Lab Sheet 07 — self-contained Django demonstration
# Install first: pip install django
# Run: python Lab7.py
import sys
from django.conf import settings
from django.http import HttpResponse
from django.template import engines
from django.urls import path
from django import setup

if not settings.configured:
    settings.configure(
        DEBUG=True, SECRET_KEY="lab7-secret", ROOT_URLCONF=__name__,
        ALLOWED_HOSTS=["*"], MIDDLEWARE=[],
        TEMPLATES=[{"BACKEND":"django.template.backends.django.DjangoTemplates",
                    "APP_DIRS":False,"OPTIONS":{"loaders":[("django.template.loaders.locmem.Loader",{})]}}]
    )
setup()

fruits=["Apple","Banana","Mango","Orange","Pineapple"]
students=[
    {"name":"Aarav","event":"Hackathon","roll":"101"},
    {"name":"Ishika","event":"Coding Contest","roll":"102"},
    {"name":"Riya","event":"Workshop","roll":"103"},
    {"name":"Kabir","event":"Hackathon","roll":"104"},
]

HTML="""
<!doctype html><html><head><title>Lab 7</title>
<style>body{font-family:Arial;max-width:900px;margin:40px auto;background:#f5f7fb}
.box{background:white;padding:25px;border-radius:12px;margin:15px 0}table{width:100%;border-collapse:collapse}
th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}a,button{padding:8px 12px;background:#2563eb;color:white;border:0;border-radius:6px;text-decoration:none}
input{padding:9px;width:60%}.alert{color:#b91c1c;background:#fee2e2;padding:10px;border-radius:7px}</style></head>
<body><div class="box"><h1>Fruits and Event Students</h1>
<form><input name="q" value="{{ q }}" placeholder="Search student name/event"><button>Search</button></form>
{% if fruits %}<h2>Fruits</h2><ul>{% for fruit in fruits %}<li>{{ fruit }}</li>{% endfor %}</ul>{% else %}<div class="alert">Fruit array is empty.</div>{% endif %}
{% if students %}<h2>Selected Event Students</h2>
<table><tr><th><a href="?sort=name">Student Name</a></th><th>Roll</th><th>Event</th></tr>
{% for s in students %}<tr><td>{{ s.name }}</td><td>{{ s.roll }}</td><td>{{ s.event }}</td></tr>{% endfor %}
</table>{% else %}<div class="alert">No student records found.</div>{% endif %}
</div></body></html>
"""

def home(request):
    q=request.GET.get("q","").strip().lower()
    sort=request.GET.get("sort","")
    data=[s for s in students if q in s["name"].lower() or q in s["event"].lower()]
    if sort=="name": data=sorted(data,key=lambda x:x["name"].lower())
    template=engines["django"].from_string(HTML)
    return HttpResponse(template.render({"fruits":fruits,"students":data,"q":q}))

urlpatterns=[path("",home)]
if __name__=="__main__":
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
