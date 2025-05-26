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
        'medical_record_id',
        'name',
        'respondents',
    ];

    public function client()
    {
        return $this->belongsTo(ClientsModel::class);
    }

    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecords::class);
    }
    
    public function questions()
    {
    return $this->hasMany(PemeQItem::class);
    }
}