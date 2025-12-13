<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Group extends Model
{
    protected $fillable = ['id_parent', 'name'];
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'id_group');
    }
    public function children(): HasMany
    {
        return $this->hasMany(Group::class, 'id_parent');
    }
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'id_parent');
    }
    public function getProductsCountAttribute(): int
    {
        $count = $this->products()->count();
        foreach ($this->children as $child) {
            $count += $child->products_count;
        }
        return $count;
    }
    public function getAllChildrenIds(): array
    {
        $ids = [$this->id];
        foreach ($this->children as $child) {
            $ids = array_merge($ids, $child->getAllChildrenIds());
        }
        return $ids;
    }
}

