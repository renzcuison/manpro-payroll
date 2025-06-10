<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupLifePlanModel extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $table = 'group_life_plans';

    protected $primaryKey = 'id';

    protected $fillable = ['group_life_company_id',
                            'plan_name',
                            'type',
                            'employer_share',
                            'employee_share',
                            'created_at',
                            'updated_at',
                            'deleted_at'];

    public function company() {
        return $this->belongsTo(GroupLifeCompanyModel::class, 'group_life_company_id');
    }
    
}
