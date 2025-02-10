from fastapi.testclient import TestClient
from app.main import app

def test_create_pizza(client: TestClient):
    # Create toppings first
    topping1 = client.post("/api/toppings/", json={"name": "Pepperoni"}).json()
    topping2 = client.post("/api/toppings/", json={"name": "Mushrooms"}).json()
    
    response = client.post(
        "/api/pizzas/",
        json={
            "name": "Supreme",
            "topping_ids": [topping1["id"], topping2["id"]]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Supreme"
    assert len(data["toppings"]) == 2

def test_get_pizzas(client: TestClient):
    # Create topping and pizza first
    topping = client.post("/api/toppings/", json={"name": "Pepperoni"}).json()
    client.post(
        "/api/pizzas/",
        json={
            "name": "Pepperoni Pizza",
            "topping_ids": [topping["id"]]
        }
    )
    
    response = client.get("/api/pizzas/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(pizza["name"] == "Pepperoni Pizza" for pizza in data)

def test_create_duplicate_pizza_name(client: TestClient):
    # Create topping
    topping = client.post("/api/toppings/", json={"name": "Pepperoni"}).json()
    
    # Create first pizza
    client.post(
        "/api/pizzas/",
        json={
            "name": "Pepperoni Pizza",
            "topping_ids": [topping["id"]]
        }
    )
    
    # Try to create duplicate
    response = client.post(
        "/api/pizzas/",
        json={
            "name": "Pepperoni Pizza",
            "topping_ids": [topping["id"]]
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_create_pizza_with_same_toppings(client: TestClient):
    # Create toppings
    topping1 = client.post("/api/toppings/", json={"name": "Pepperoni"}).json()
    topping2 = client.post("/api/toppings/", json={"name": "Mushrooms"}).json()
    
    # Create first pizza
    client.post(
        "/api/pizzas/",
        json={
            "name": "Supreme",
            "topping_ids": [topping1["id"], topping2["id"]]
        }
    )
    
    # Try to create pizza with same toppings in different order
    response = client.post(
        "/api/pizzas/",
        json={
            "name": "Different Name",
            "topping_ids": [topping2["id"], topping1["id"]]
        }
    )
    assert response.status_code == 400
    assert "combination of toppings already exists" in response.json()["detail"]

def test_update_pizza(client: TestClient):
    # Create topping and pizza
    topping = client.post("/api/toppings/", json={"name": "Pepperoni"}).json()
    pizza_response = client.post(
        "/api/pizzas/",
        json={
            "name": "Pepperoni Pizza",
            "topping_ids": [topping["id"]]
        }
    )
    pizza_id = pizza_response.json()["id"]
    
    # Create new topping and update pizza
    new_topping = client.post("/api/toppings/", json={"name": "Mushrooms"}).json()
    response = client.put(
        f"/api/pizzas/{pizza_id}",
        json={
            "name": "Supreme",
            "topping_ids": [topping["id"], new_topping["id"]]
        }
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Supreme"
    assert len(response.json()["toppings"]) == 2

def test_delete_pizza(client: TestClient):
    # Create topping and pizza
    topping = client.post("/api/toppings/", json={"name": "Pepperoni"}).json()
    pizza_response = client.post(
        "/api/pizzas/",
        json={
            "name": "Pepperoni Pizza",
            "topping_ids": [topping["id"]]
        }
    )
    pizza_id = pizza_response.json()["id"]
    
    # Delete pizza
    response = client.delete(f"/api/pizzas/{pizza_id}")
    assert response.status_code == 200