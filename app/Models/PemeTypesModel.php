<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemeTypesModel extends Model
{
    use HasFactory;

    protected $table = 'peme_types';

    // Mass assignable attributes
    protected $fillable = [
        'name',
    ];

    // If you want to use soft deletes
    protected $dates = ['deleted_at'];

    // Relationship: each PEME type belongs to a client
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}