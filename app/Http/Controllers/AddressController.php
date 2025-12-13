<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
class AddressController extends Controller
{
    public function index(Request $request, User $user)
    {
        $authenticatedUser = $request->user();
        if (!$authenticatedUser || $authenticatedUser->id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json($user->addresses);
    }
    public function store(Request $request, User $user)
    {
        $validated = $request->validate(['address' => 'required|string|max:255']);
        $address = $user->addresses()->create($validated);
        return response()->json($address, Response::HTTP_CREATED);
    }
    public function show(User $user, Address $address)
    {
        if ($address->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
        return response()->json($address);
    }
}
