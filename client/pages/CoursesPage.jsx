import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { api } from '../services/api';

export default function CoursesPage({
  user,
  onSelectCourse,
  searchQuery,
  onClearSearch
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [price, setPrice] = useState('all');
  const [sort, setSort] = useState('popular');

  const categories = ['All', 'Development', 'Data Science', 'Design', 'DevOps'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, category, difficulty, price, sort]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (price !== 'all') params.price = price;
      if (sort) params.sort = sort;

      const res = await api.getCourses(params);
      if (res.success) {
        setCourses(res.courses || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setDifficulty('All');
    setPrice('all');
    setSort('popular');
    if (onClearSearch) onClearSearch();
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Explore All Courses
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Discover hands-on courses taught by industry veterans and engineer your future.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Search input + Sort */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by course title, skill, or instructor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem', height: 44, borderRadius: 'var(--radius-md)' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          <div style={{ flex: '0 1 220px' }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ height: 44, borderRadius: 'var(--radius-md)' }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Releases</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter Chips: Category, Difficulty, Price */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem'
        }}>
          {/* Categories */}
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: 4 }}>
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`badge ${category === cat ? 'badge-primary' : 'badge-secondary'}`}
                style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty & Price Selectors */}
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === 'All' ? 'All Difficulties' : diff}
                </option>
              ))}
            </select>

            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <option value="all">All Prices</option>
              <option value="free">Free Courses</option>
              <option value="paid">Paid Courses</option>
            </select>

            {(searchTerm || category !== 'All' || difficulty !== 'All' || price !== 'all') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={resetFilters}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Courses Results Grid */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing {courses.length} of {total} courses
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div className="progress-bar-container" style={{ width: 200, margin: '0 auto 1rem', height: 4 }}>
            <div className="progress-bar-fill" style={{ width: '60%' }} />
          </div>
          Filtering catalog...
        </div>
      ) : courses.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: 550,
            margin: '0 auto'
          }}
        >
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No courses found matching your criteria
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Try adjusting your search keywords, clear category filters, or explore our full collection.
          </p>
          <button className="btn btn-primary" onClick={resetFilters}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid-courses">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onSelectCourse={onSelectCourse}
              isEnrolled={user && user.enrolledCourses && user.enrolledCourses.includes(course._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
