<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Signatory extends Model
{
    use HasFactory;

    protected $fillable = [
        'prepared_by',
        'approved_by_one',
        'approved_by_two',
        'approved_by_three',
        'reviewed_by',
    ];
    
}
