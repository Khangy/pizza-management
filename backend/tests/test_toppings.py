from fastapi.testclient import TestClient
from app.main import app

def test_create_topping(client: TestClient):
    response = client.post(
        "/api/toppings/",
        json={"name": "Pepperoni"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Pepperoni"
    assert "id" in data

def test_get_toppings(client: TestClient):
    # Create a topping first
    client.post("/api/toppings/", json={"name": "Mushrooms"})
    
    response = client.get("/api/toppings/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(topping["name"] == "Mushrooms" for topping in data)

def test_create_duplicate_topping(client: TestClient):
    # Create first topping
    client.post("/api/toppings/", json={"name": "Pepperoni"})
    
    # Try to create duplicate
    response = client.post(
        "/api/toppings/",
        json={"name": "Pepperoni"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_update_topping(client: TestClient):
    # Create topping
    create_response = client.post(
        "/api/toppings/",
        json={"name": "Onions"}
    )
    topping_id = create_response.json()["id"]
    
    # Update topping
    response = client.put(
        f"/api/toppings/{topping_id}",
        json={"name": "Red Onions"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Red Onions"

def test_delete_unused_topping(client: TestClient):
    # Create topping
    create_response = client.post(
        "/api/toppings/",
        json={"name": "Olives"}
    )
    topping_id = create_response.json()["id"]
    
    # Delete topping
    response = client.delete(f"/api/toppings/{topping_id}")
    assert response.status_code == 200

def test_delete_topping_used_in_pizza(client: TestClient):
    # Create topping
    topping_response = client.post(
        "/api/toppings/",
        json={"name": "Pepperoni"}
    )
    topping_id = topping_response.json()["id"]
    
    # Create pizza with this topping
    client.post(
        "/api/pizzas/",
        json={
            "name": "Pepperoni Pizza",
            "topping_ids": [topping_id]
        }
    )
    
    # Try to delete topping
    response = client.delete(f"/api/toppings/{topping_id}")
    assert response.status_code == 400
    assert "used in existing pizzas" in response.json()["detail"]["message"]