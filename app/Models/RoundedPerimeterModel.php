<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoundedPerimeterModel extends Model
{
    use HasFactory;

    protected $table = 'rounded_perimeters';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'radius',
        'latitude',
        'longitude',
        'location',
        'status',
        'client_id',
    ];

    public function workGroups()
    {
        return $this->hasMany(WorkGroupsModel::class, 'rounded_perimeter_id');
    }
}
