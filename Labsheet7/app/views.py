from django.shortcuts import render
def home(request):
    fruits=[
        "Apple","Banana","Mango","Orange","Grapes"
    ]
    students = [
        {"name": "Vanshika", "roll": 101, "event": "Hackathon"},
        {"name": "Ananya", "roll": 102, "event": "Coding"},
        {"name": "Rahul", "roll": 103, "event": "Quiz"},
        {"name": "Priya", "roll": 104, "event": "Coding"},
        {"name": "Arjun", "roll": 105, "event": "Hackathon"},
    ]
    search=request.GET.get("search","")
    if search:
        students = [
            student for student in students
            if search.lower() in student["name"].lower()
        ]
    #Sorting
    sort=request.GET.get("sort","")
    if sort=="name":
        students=sorted(students,key=lambda x:x["name"])
    elif sort=="roll":
        students=sorted(students,key=lambda x:x["roll"])
    context={
        "fruits":fruits,
        "students":students,
        "search":search,
    }
    return render(request,"index.html",context)

        
