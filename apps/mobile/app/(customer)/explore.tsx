import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { getProducts, Product } from '@hastkala/core';
import ProductCard from '../../components/ProductCard';

const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low'];

export default function ExploreScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        limit: 50
      });
      setProducts(result || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(c => !!c) as string[]);
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const materials = useMemo(() => {
    const mats = new Set(products.map(p => p.material).filter(m => !!m) as string[]);
    return ['All', ...Array.from(mats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const searchLower = searchQuery.toLowerCase().trim();
      const titleMatch = p.title?.toLowerCase().includes(searchLower);
      const artisanMatch = p.artisanName?.toLowerCase().includes(searchLower) || p.artisanId?.toLowerCase().includes(searchLower);
      const categoryMatchSearch = p.category?.toLowerCase().includes(searchLower);
      const materialMatchSearch = p.material?.toLowerCase().includes(searchLower);
      
      const matchesSearch = !searchLower || titleMatch || artisanMatch || categoryMatchSearch || materialMatchSearch;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesMaterial = selectedMaterial === 'All' || p.material === selectedMaterial;
      
      return matchesSearch && matchesCategory && matchesMaterial;
    }).sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      
      if (sortBy === 'Price: Low to High') return priceA - priceB;
      if (sortBy === 'Price: High to Low') return priceB - priceA;
      
      // Default: Newest
      const dateA = (a.createdAt as any)?.toMillis?.() || new Date((a.createdAt || 0) as string | number).getTime();
      const dateB = (b.createdAt as any)?.toMillis?.() || new Date((b.createdAt || 0) as string | number).getTime();
      return dateB - dateA;
    });
  }, [products, searchQuery, selectedCategory, selectedMaterial, sortBy]);

  const renderPill = (item: string, selected: string, onSelect: (val: string) => void) => (
    <TouchableOpacity 
      style={[styles.categoryPill, selected === item && styles.categoryPillActive]}
      onPress={() => onSelect(item)}
    >
      <Text style={[styles.categoryText, selected === item && styles.categoryTextActive]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Marketplace</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, materials, artisans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories.length > 1 ? categories : ['All', 'Textiles', 'Pottery', 'Decor', 'Paintings']}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => renderPill(item, selectedCategory, setSelectedCategory)}
            keyExtractor={item => item}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <TouchableOpacity 
          style={styles.filterToggleBtn} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>{showFilters ? 'Hide Filters' : 'Show Advanced Filters'}</Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.expandedFilters}>
            <Text style={styles.filterLabel}>Material</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList} style={{marginBottom: 10, maxHeight: 40}}>
              {materials.map(item => (
                <React.Fragment key={`mat-${item}`}>
                  {renderPill(item, selectedMaterial, setSelectedMaterial)}
                </React.Fragment>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Sort By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList} style={{maxHeight: 40}}>
              {SORT_OPTIONS.map(item => (
                <React.Fragment key={`sort-${item}`}>
                  {renderPill(item, sortBy, setSortBy)}
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No products found matching your search.</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedMaterial('All');
            setSortBy('Newest');
          }}>
            <Text style={styles.clearBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item, index) => (item.id || item._id || index.toString()) as string}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoriesContainer: {
    height: 40,
    marginBottom: 8,
  },
  categoriesList: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  categoryText: {
    color: '#2F4F4F',
    fontWeight: 'bold',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  filterToggleBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterToggleText: {
    color: '#8B4513',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  expandedFilters: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});
