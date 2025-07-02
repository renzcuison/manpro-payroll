<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EmployeeTemplateExport;

class ExcelController extends Controller
{
    public function downloadEmployeeTemplate()
    {
        Log::info("ExcelController::downloadEmployeeTemplate");

        return Excel::download(new EmployeeTemplateExport, 'employee_template.csv', \Maatwebsite\Excel\Excel::CSV);
    }
}
