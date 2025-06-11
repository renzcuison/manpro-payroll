<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupLifeCompanyModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'group_life_companies';

    protected $primaryKey = 'id';

    protected $fillable = [ 'name', 
                            'noOfPlans'];

    public function plans()
    {
        return $this->hasMany(GroupLifePlanModel::class, 'group_life_company_id', 'id');
    }
}