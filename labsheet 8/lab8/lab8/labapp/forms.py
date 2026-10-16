from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(max_length=80, widget=forms.TextInput(attrs={"class": "form-control"}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={"class": "form-control"}))
    subject = forms.CharField(max_length=120, widget=forms.TextInput(attrs={"class": "form-control"}))
    message = forms.CharField(min_length=10, widget=forms.Textarea(attrs={"class": "form-control", "rows": 5}))
