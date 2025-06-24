<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HMOCompany extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hmo_companies';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name', 
        'client_id',
        'plans_count'
    ];

    public function client() {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }

    public function plans()
    {
        return $this->hasMany(HMOCompanyPlan::class, 'hmo_company_id', 'id');
    }
}
