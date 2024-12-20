<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrBank extends Model
{
    use HasFactory;

    protected  $table = 'hr_bank';

    protected $primaryKey = 'bank_id';

    protected $fillable = [
        'bank_name',
        'is_deleted'
    ];
}
