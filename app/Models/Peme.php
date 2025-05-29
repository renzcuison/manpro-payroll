<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Peme extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme';
    protected $primaryKey = 'id';
    protected $fillable = [
        'client_id',
        'user_id',
        'medical_record_id',
        'respondents',
        'isVisible',    
        'isEditable', 
    ];

    public function client()
    {
        return $this->belongsTo(ClientsModel::class);
    }

    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecords::class, 'medical_record_id', 'id');
    }

    public function questions()
    {
        return $this->hasMany(PemeQItem::class);
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id', 'id');
    }
}
