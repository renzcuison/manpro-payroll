<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrBranch extends Model
{
    use HasFactory;

    protected  $table = 'hr_branch';

    protected $primaryKey = 'branch_id';

    protected $fillable = [
        'branch_name',
        'is_deleted'
    ];
}
