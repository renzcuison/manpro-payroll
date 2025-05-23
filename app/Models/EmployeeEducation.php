<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeEducation extends Model
{
    use HasFactory, softDeletes;

    protected $table = 'employee_educations';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'school_name',
        'degree_type',
        'degree_name',
        'year_graduated',
    ];

    public function user(){
        return $this->belongsTo(UsersModes::class, 'user_id');
    }

}
