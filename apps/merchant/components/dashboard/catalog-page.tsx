"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { ProductModal } from "./product-modal";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  categoryId: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  products: Product[];
}

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Pizza",
    isActive: true,
    sortOrder: 1,
    products: [
      {
        id: "1",
        name: "Margherita Pizza",
        description: "Classic cheese pizza with tomato sauce",
        price: 299,
        categoryId: "cat-1",
        image: "/placeholder.svg?height=80&width=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: "2",
        name: "Pepperoni Pizza",
        description: "Pizza with pepperoni and cheese",
        price: 349,
        categoryId: "cat-1",
        image: "/placeholder.svg?height=80&width=80",
        isActive: true,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "cat-2",
    name: "Curries",
    isActive: true,
    sortOrder: 2,
    products: [
      {
        id: "3",
        name: "Butter Chicken",
        description: "Creamy tomato-based curry with chicken",
        price: 349,
        categoryId: "cat-2",
        image: "/placeholder.svg?height=80&width=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: "4",
        name: "Palak Paneer",
        description: "Spinach curry with cottage cheese",
        price: 249,
        categoryId: "cat-2",
        image: "/placeholder.svg?height=80&width=80",
        isActive: true,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "cat-3",
    name: "Breads",
    isActive: true,
    sortOrder: 3,
    products: [
      {
        id: "5",
        name: "Garlic Naan",
        description: "Soft naan bread with garlic butter",
        price: 79,
        categoryId: "cat-3",
        image: "/placeholder.svg?height=80&width=80",
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
];

export const CatalogPage = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleToggleCategoryActive = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));
  };

  const handleToggleProductActive = (categoryId: string, productId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              products: cat.products.map((prod) =>
                prod.id === productId
                  ? { ...prod, isActive: !prod.isActive }
                  : prod
              ),
            }
          : cat
      )
    );
  };

  const handleDeleteProduct = (categoryId: string, productId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              products: cat.products.filter((prod) => prod.id !== productId),
            }
          : cat
      )
    );
  };

  const handleAddProductClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProductClick = (product: Product) => {
    setSelectedCategoryId(product.categoryId);
    setEditingProduct(product);
    setShowProductModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catalog</h1>
          <p className="text-muted-foreground">Manage your menu structure</p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCategoryActive(category.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      category.isActive ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        category.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {category.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="font-semibold text-foreground">
                      R${product.price}
                    </span>

                    <button
                      onClick={() =>
                        handleToggleProductActive(category.id, product.id)
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        product.isActive ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          product.isActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProductClick(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDeleteProduct(category.id, product.id)
                      }
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full gap-2 mt-2 bg-transparent"
                onClick={() => handleAddProductClick(category.id)}
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showProductModal && selectedCategoryId && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onSave={() => setShowProductModal(false)}
          product={editingProduct}
        />
      )}
    </div>
  );
};
