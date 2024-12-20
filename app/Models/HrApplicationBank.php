<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrApplicationBranch extends Model
{
    use HasFactory;

    protected $table = 'hr_branch';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'branch_name',
        'team',
        'created_at',
        'updated_at'
    ];
}