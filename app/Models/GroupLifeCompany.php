<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupLifeCompany extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'group_life_companies';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name', 
        'client_id'
    ];

    public function client() {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }

    public function plans()
    {
        return $this->hasMany(GroupLifeCompanyPlan::class, 'group_life_company_id', 'id');
    }
}
