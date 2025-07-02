<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;

class EmployeeTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithCustomCsvSettings
{
    public function array(): array
    {
        return [];
    }

    public function headings(): array
    {
        return [
            'Username',
            'Email',
            'First Name',
            'Middle Name',
            'Last Name',
            'Suffix',
            'Birthdate'
        ];
    }

    public function getCsvSettings(): array
    {
        return [
            'delimiter' => ',',
            'enclosure' => '"',
            'line_ending' => PHP_EOL,
            'use_bom' => true,
        ];
    }
}
