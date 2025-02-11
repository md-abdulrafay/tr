from django.shortcuts import render, redirect
from .models import Source, UserIncome
from django.core.paginator import Paginator
from userpreferences.models import UserPreference
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import json
from django.http import JsonResponse, HttpResponse
import datetime
import csv
# Create your views here.


@login_required(login_url='/authentication/login')
def search_income(request):
    if request.method == 'POST':
        search_str = json.loads(request.body).get('searchText')
        income = UserIncome.objects.filter(
            amount__istartswith=search_str, owner=request.user) | UserIncome.objects.filter(
            date__istartswith=search_str, owner=request.user) | UserIncome.objects.filter(
            description__icontains=search_str, owner=request.user) | UserIncome.objects.filter(
            source__icontains=search_str, owner=request.user)
        data = income.values()
        return JsonResponse(list(data), safe=False)


@login_required(login_url='/authentication/login')
def index(request):
    categories = Source.objects.all()
    income = UserIncome.objects.filter(owner=request.user)
    paginator = Paginator(income, 5)
    page_number = request.GET.get('page')
    page_obj = Paginator.get_page(paginator, page_number)
    currency = UserPreference.objects.get(user=request.user).currency
    context = {
        'income': income,
        'page_obj': page_obj,
        'currency': currency
    }
    return render(request, 'income/index.html', context)


@login_required(login_url='/authentication/login')
def add_income(request):
    sources = Source.objects.all()
    context = {
        'sources': sources,
        'values': request.POST
    }
    if request.method == 'GET':
        return render(request, 'income/add_income.html', context)

    if request.method == 'POST':
        amount = request.POST['amount']

        if not amount:
            messages.error(request, 'Amount is required')
            return render(request, 'income/add_income.html', context)
        description = request.POST['description']
        date = request.POST['income_date']
        source = request.POST['source']

        if not description:
            messages.error(request, 'description is required')
            return render(request, 'income/add_income.html', context)

        UserIncome.objects.create(owner=request.user, amount=amount, date=date,
                                  source=source, description=description)
        messages.success(request, 'Record saved successfully')

        return redirect('income')


@login_required(login_url='/authentication/login')
def income_edit(request, id):
    income = UserIncome.objects.get(pk=id)
    sources = Source.objects.all()
    context = {
        'income': income,
        'values': income,
        'sources': sources
    }
    if request.method == 'GET':
        return render(request, 'income/edit_income.html', context)
    if request.method == 'POST':
        amount = request.POST['amount']

        if not amount:
            messages.error(request, 'Amount is required')
            return render(request, 'income/edit_income.html', context)
        description = request.POST['description']
        date = request.POST['income_date']
        source = request.POST['source']

        if not description:
            messages.error(request, 'description is required')
            return render(request, 'income/edit_income.html', context)
        income.amount = amount
        income. date = date
        income.source = source
        income.description = description

        income.save()
        messages.success(request, 'Record updated  successfully')

        return redirect('income')


def delete_income(request, id):
    income = UserIncome.objects.get(pk=id)
    income.delete()
    messages.success(request, 'record removed')
    return redirect('income')


@login_required(login_url='/authentication/login')
def income_stats_view(request):
    return render(request, 'income/stats.html')


@login_required(login_url='/authentication/login')
def income_category_summary(request):
    todays_date = datetime.date.today()
    six_months_ago = todays_date - datetime.timedelta(days=30*6)
    start_of_week = todays_date - datetime.timedelta(days=todays_date.weekday())
    start_of_year = datetime.date(todays_date.year, 1, 1)

    income = UserIncome.objects.filter(owner=request.user,
                                       date__gte=six_months_ago, date__lte=todays_date)
    weekly_income = UserIncome.objects.filter(owner=request.user,
                                              date__gte=start_of_week, date__lte=todays_date)
    yearly_income = UserIncome.objects.filter(owner=request.user,
                                              date__gte=start_of_year, date__lte=todays_date)

    finalrep = {}
    weekly_rep = {day: 0 for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
    yearly_rep = {month: 0 for month in ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}

    def get_source(income):
        return income.source
    source_list = list(set(map(get_source, income)))

    def get_income_source_amount(source):
        amount = 0
        filtered_by_source = income.filter(source=source)

        for item in filtered_by_source:
            amount += item.amount  # Ensure amount is a float
        return amount

    for y in source_list:
        finalrep[y] = get_income_source_amount(y)

    for income in weekly_income:
        date_str = income.date.strftime('%A')
        weekly_rep[date_str] += income.amount

    for income in yearly_income:
        month_str = income.date.strftime('%B')
        yearly_rep[month_str] += income.amount

    return JsonResponse({
        'income_category_data': finalrep,
        'weekly_income_data': weekly_rep,
        'yearly_income_data': yearly_rep
    }, safe=False)


@login_required(login_url='/authentication/login')
def export_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=income.csv'

    writer = csv.writer(response)
    writer.writerow(['Amount', 'Source', 'Description', 'Date'])

    income = UserIncome.objects.filter(owner=request.user)

    for inc in income:
        writer.writerow([inc.amount, inc.source, inc.description, inc.date])

    return response
