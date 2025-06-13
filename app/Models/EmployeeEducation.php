<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeEducation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'employee_educations';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'school_name',
        'education_level',
        'program_name',
        'year_graduated',
    ];

    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

}
