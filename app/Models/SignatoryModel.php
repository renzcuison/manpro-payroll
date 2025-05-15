<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ClientsModel;

class SignatoryModel extends Model
{
    use HasFactory;

    protected $table = 'signatories';

    protected $fillable = [
        'purpose',
        'name',
        'position',
        'client_id',
    ];

    public function client()
    {
        return $this->belongsTo(ClientsModel::class);
    }
}

