<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientsModel extends Model
{
    use HasFactory;

    protected $table = 'clients';

    protected $primaryKey = 'id';

    protected $fillable = [
        'unique_code',
        'name',
        'package',
        'status',
    ];

    public function employees()
    {
        return $this->hasMany(UsersModel::class, 'client_id')->where('user_type', 'Employee');
    }

    public function allowances()
    {
        return $this->hasMany(AllowancesModel::class, 'client_id');
    }
}
