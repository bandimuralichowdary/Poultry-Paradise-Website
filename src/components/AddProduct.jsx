import React, { useState } from "react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [imageMode, setImageMode] = useState("link"); // "link" or "upload"
  const [imageLink, setImageLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Uploading...");

    try {
      let res;

      // 🔹 Case 1: Use image link
      if (imageMode === "link") {
        res = await fetch("/make-server-6c34fe24/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            category,
            subcategory,
            price,
            unit,
            description,
            stock,
            image: imageLink,
          }),
        });
      } 
      // 🔹 Case 2: Upload image file
      else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", category);
        formData.append("subcategory", subcategory);
        formData.append("price", price);
        formData.append("unit", unit);
        formData.append("description", description);
        formData.append("stock", stock);
        if (imageFile) formData.append("image", imageFile);

        res = await fetch("/make-server-6c34fe24/products", {
          method: "POST",
          body: formData,
        });
      }

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Product added successfully!");
        console.log("Product:", data.product);
      } else {
        setMessage("❌ " + (data.error || "Failed to add product"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="border p-2 w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border p-2 w-full" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <input className="border p-2 w-full" placeholder="Subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input className="border p-2 w-full" placeholder="Unit (e.g. kg, dozen)" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />

        <div className="border p-3 rounded">
          <p className="font-semibold mb-2">Product Image:</p>
          <label className="mr-4">
            <input type="radio" name="imageMode" checked={imageMode === "link"} onChange={() => setImageMode("link")} /> Paste Link
          </label>
          <label>
            <input type="radio" name="imageMode" checked={imageMode === "upload"} onChange={() => setImageMode("upload")} /> Upload File
          </label>

          {imageMode === "link" ? (
            <input
              className="border p-2 w-full mt-2"
              placeholder="Enter image URL"
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
            />
          ) : (
            <input
              className="border p-2 w-full mt-2"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          )}
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Add Product
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
