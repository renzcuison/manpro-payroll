<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MedicalRecords extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'medical_records';
    protected $primaryKey = 'id';
    protected $fillable = [
        'user_id',
        'client_id',
        'name',
        'notes',
    ];
    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id', 'id');
    }

    public function client()
    {
        return $this->belongsTo(ClientsModel::class);
    }
}
