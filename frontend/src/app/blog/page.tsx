"use client"

import BlogCard from '@/components/common/BlogCard';
import { useGetPosts, useGetCategoriesWithCounts, useGetPopularTags } from '@/hooks/TanStack/mutations';
import { Flame, Clock, MessageCircle, Heart, Tag, Filter, X, ChevronDown } from 'lucide-react';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GetPostsQuery } from '@/types/post';

const skeletonCount = 8;

// Filter options
type SortOption = {
    label: string;
    value: GetPostsQuery['sortBy'];
    order: GetPostsQuery['sortOrder'];
    icon: React.ReactNode;
};

const sortOptions: SortOption[] = [
    { label: 'Latest', value: 'createdAt', order: 'desc', icon: <Clock className="h-4 w-4" /> },
    { label: 'Most Liked', value: 'likesCount', order: 'desc', icon: <Heart className="h-4 w-4" /> },
    { label: 'Most Discussed', value: 'commentsCount', order: 'desc', icon: <MessageCircle className="h-4 w-4" /> },
    { label: 'Trending', value: 'likesCount', order: 'desc', icon: <Flame className="h-4 w-4" /> },
];

function BlogCardSkeleton() {
    return (
        <div className="px-3 mb-5 w-full max-w-[400px] mx-auto space-y-2">
            <Skeleton className="h-48 w-full rounded-t-md" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-8 w-full mt-4" />
        </div>
    );
}

function CategorySkeleton() {
    return (
        <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
        </div>
    );
}

function Page() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get initial values from URL params
    const initialCategory = searchParams.get('category') || '';
    const initialTag = searchParams.get('tag') || '';
    const initialSort = (searchParams.get('sort') as GetPostsQuery['sortBy']) || 'createdAt';
    const initialOrder = (searchParams.get('order') as GetPostsQuery['sortOrder']) || 'desc';
    const initialPage = parseInt(searchParams.get('page') || '1', 10);

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedTag, setSelectedTag] = useState(initialTag);
    const [sortBy, setSortBy] = useState<GetPostsQuery['sortBy']>(initialSort);
    const [sortOrder, setSortOrder] = useState<GetPostsQuery['sortOrder']>(initialOrder);

    const [query, setQuery] = useState<GetPostsQuery>({
        category: initialCategory || undefined,
        tag: initialTag || undefined,
        published: 'true',
        limit: 8, // Smaller limit to show pagination
        page: initialPage,
        sortBy: initialSort,
        sortOrder: initialOrder,
    });

    // Fetch data
    const { data: postsData, isLoading: postsLoading } = useGetPosts(query);
    const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesWithCounts();
    const { data: tagsData, isLoading: tagsLoading } = useGetPopularTags();

    const posts = postsData?.data?.posts || [];
    const pagination = postsData?.data?.pagination;
    const totalPages = pagination?.totalPages || 1;
    const categories = categoriesData?.data || [];
    const popularTags = tagsData?.data || [];

    // Get current sort option
    const currentSortOption = sortOptions.find(
        opt => opt.value === sortBy && opt.order === sortOrder
    ) || sortOptions[0];

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedTag) params.set('tag', selectedTag);
        if (sortBy && sortBy !== 'createdAt') params.set('sort', sortBy);
        if (sortOrder && sortOrder !== 'desc') params.set('order', sortOrder);
        if (currentPage > 1) params.set('page', currentPage.toString());

        const queryString = params.toString();
        router.replace(queryString ? `/blog?${queryString}` : '/blog', { scroll: false });
    }, [selectedCategory, selectedTag, sortBy, sortOrder, currentPage, router]);

    // Handlers
    const handleCategoryChange = (categorySlug: string) => {
        const newCategory = selectedCategory === categorySlug ? '' : categorySlug;
        setSelectedCategory(newCategory);
        setCurrentPage(1);
        setQuery(prev => ({ ...prev, category: newCategory || undefined, page: 1 }));
    };

    const handleTagChange = (tag: string) => {
        const newTag = selectedTag === tag ? '' : tag;
        setSelectedTag(newTag);
        setCurrentPage(1);
        setQuery(prev => ({ ...prev, tag: newTag || undefined, page: 1 }));
    };

    const handleSortChange = (option: SortOption) => {
        setSortBy(option.value);
        setSortOrder(option.order);
        setCurrentPage(1);
        setQuery(prev => ({ ...prev, sortBy: option.value, sortOrder: option.order, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        setQuery(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedTag('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
        setQuery({
            published: 'true',
            limit: 8,
            page: 1,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    };

    const hasActiveFilters = selectedCategory || selectedTag || sortBy !== 'createdAt';

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <main className='pt-16 pb-24 md:pt-9 min-h-screen w-full px-0 md:px-12 text-[var(--custom-textColor)]'>
            {/* Header */}
            <div className="py-14 flex px-4 text-center md:text-start flex-col md:gap-8 gap-4 font-NeuMachina">
                <h1 className='text-5xl md:text-7xl md:leading-20'>
                    Explore <span className='text-[var(--custom-primary)]'>our <br className="hidden md:block" /> blogs.</span>
                </h1>
                <p className='text-sm md:text-2xl text-muted-foreground'>
                    Discover insights, tutorials, and stories from our community.
                </p>
            </div>

            {/* Categories Horizontal Scroll */}
            <section className="mb-8 px-4">
                <h2 className="text-lg md:text-xl font-NeuMachina mb-4 flex items-center gap-2">
                    <Filter className="h-5 w-5" /> Categories
                </h2>
                {categoriesLoading ? (
                    <CategorySkeleton />
                ) : (
                    <div className="overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            <Badge
                                variant={!selectedCategory ? "default" : "outline"}
                                className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                                onClick={() => handleCategoryChange('')}
                            >
                                All
                            </Badge>
                            {categories.map((cat) => (
                                <Badge
                                    key={cat._id}
                                    variant={selectedCategory === cat.slug ? "default" : "outline"}
                                    className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity whitespace-nowrap"
                                    style={selectedCategory === cat.slug ? { backgroundColor: cat.color, color: '#fff' } : {}}
                                    onClick={() => handleCategoryChange(cat.slug)}
                                >
                                    {cat.name} ({cat.postCount})
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Popular Tags */}
            <section className="mb-8 px-4">
                <h2 className="text-lg md:text-xl font-NeuMachina mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" /> Popular Tags
                </h2>
                {tagsLoading ? (
                    <CategorySkeleton />
                ) : popularTags.length > 0 ? (
                    <div className="block sm:hidden">
                        <Swiper
                            modules={[FreeMode]}
                            freeMode={true}
                            slidesPerView="auto"
                            spaceBetween={8}
                            className="w-full"
                        >
                            {popularTags.map((tagData) => (
                                <SwiperSlide key={tagData.tag} className="!w-auto">
                                    <Badge
                                        variant={selectedTag === tagData.tag ? "default" : "secondary"}
                                        className="cursor-pointer px-3 py-1.5 text-sm hover:opacity-80 transition-opacity"
                                        onClick={() => handleTagChange(tagData.tag)}
                                    >
                                        #{tagData.tag} ({tagData.count})
                                    </Badge>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                ) : null}
                {!tagsLoading && popularTags.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-2">
                        {popularTags.map((tagData) => (
                            <Badge
                                key={tagData.tag}
                                variant={selectedTag === tagData.tag ? "default" : "secondary"}
                                className="cursor-pointer px-3 py-1.5 text-sm hover:opacity-80 transition-opacity"
                                onClick={() => handleTagChange(tagData.tag)}
                            >
                                #{tagData.tag} ({tagData.count})
                            </Badge>
                        ))}
                    </div>
                )}
            </section>

            {/* Sort & Filter Bar */}
            <section className="mb-8 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                {currentSortOption.icon}
                                {currentSortOption.label}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {sortOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.label}
                                    onClick={() => handleSortChange(option)}
                                    className="gap-2 cursor-pointer"
                                >
                                    {option.icon}
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Active Filters */}
                    {selectedCategory && (
                        <Badge variant="secondary" className="gap-1">
                            {categories.find(c => c.slug === selectedCategory)?.name}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => handleCategoryChange('')}
                            />
                        </Badge>
                    )}
                    {selectedTag && (
                        <Badge variant="secondary" className="gap-1">
                            #{selectedTag}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => handleTagChange('')}
                            />
                        </Badge>
                    )}

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                            Clear all
                        </Button>
                    )}
                </div>

                {/* Results count */}
                <p className="text-sm text-muted-foreground">
                    {postsLoading ? 'Loading...' : `${pagination?.total || posts.length} posts found`}
                </p>
            </section>

            {/* Blog Grid */}
            <section className="w-full">
                {/* Mobile Swiper */}
                <div className="block sm:hidden">
                    <Swiper
                        className="w-full"
                        slidesPerView={1}
                        spaceBetween={1}
                    >
                        {postsLoading
                            ? Array.from({ length: skeletonCount }).map((_, idx) => (
                                <SwiperSlide key={idx}>
                                    <BlogCardSkeleton />
                                </SwiperSlide>
                            ))
                            : posts.length > 0
                                ? posts.map((post) => (
                                    <SwiperSlide key={post._id}>
                                        <div className="px-3 mb-5">
                                            <BlogCard post={post} />
                                        </div>
                                    </SwiperSlide>
                                ))
                                : (
                                    <SwiperSlide>
                                        <div className="text-center py-12 text-muted-foreground">
                                            No blogs found. Try different filters.
                                        </div>
                                    </SwiperSlide>
                                )
                        }
                    </Swiper>
                </div>

                {/* Desktop Grid */}
                <div className="hidden sm:grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {postsLoading
                        ? Array.from({ length: skeletonCount }).map((_, idx) => (
                            <BlogCardSkeleton key={idx} />
                        ))
                        : posts.length > 0
                            ? posts.map((post) => (
                                <BlogCard key={post._id} post={post} />
                            ))
                            : (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No blogs found. Try different filters.
                                </div>
                            )
                    }
                </div>

                {/* Pagination */}
                {!postsLoading && posts.length > 0 && (
                    <div className="mt-12">
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(currentPage - 1);
                                            }}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {getPageNumbers().map((page, index) => (
                                        <PaginationItem key={index}>
                                            {page === 'ellipsis' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page);
                                                    }}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(currentPage + 1);
                                            }}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}

                        {/* Page info */}
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            {totalPages > 1
                                ? `Page ${currentPage} of ${totalPages} • ${pagination?.total || 0} total posts`
                                : `Showing ${posts.length} of ${pagination?.total || posts.length} posts`
                            }
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Page;
