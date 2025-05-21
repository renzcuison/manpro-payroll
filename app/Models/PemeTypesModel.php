<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeTypesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme_types';
    protected $fillable = [
        'name',
        'client_id',
    ];

    public function client()
    {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }
}
