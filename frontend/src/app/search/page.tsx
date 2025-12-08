"use client"

import BlogCard from '@/components/common/BlogCard';
import { useGetPosts } from '@/hooks/TanStack/mutations';
import { ArrowDown, Search, User } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GetPostsQuery, PostAuthor } from '@/types/post';
import Link from 'next/link';

const skeletonCount = 8;

function BlogCardSkeleton() {
    return (
        <div className="px-3 mb-5 w-full max-w-[400px] mx-auto space-y-2 bg-[var(--custom-inputColor)]">
            <Skeleton className="h-48 w-full rounded-t-md animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-6 w-3/4 animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-4 w-1/2 animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-6 w-full animate-pulse bg-[var(--custom-inputColor)]" />
            <Skeleton className="h-8 w-full animate-pulse mt-4 bg-[var(--custom-inputColor)]" />
        </div>
    );
}

function Page() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get initial values from URL params
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || '';
    const initialTag = searchParams.get('tag') || '';
    const initialPage = parseInt(searchParams.get('page') || '1', 10);

    const [searchInput, setSearchInput] = useState(initialSearch);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [query, setQuery] = useState<GetPostsQuery>({
        search: initialSearch || undefined, // Don't send empty string
        category: initialCategory || undefined,
        tag: initialTag || undefined,
        published: 'true',
        limit: 8, // Smaller limit to show pagination
        page: initialPage,
    });

    const { data, isLoading } = useGetPosts(query);
    const posts = data?.data?.posts || [];
    const pagination = data?.data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    // Extract unique authors from posts
    const uniqueAuthors = useMemo(() => {
        const authorMap = new Map<string, PostAuthor>();
        posts.forEach(post => {
            if (post.author && !authorMap.has(post.author._id)) {
                authorMap.set(post.author._id, post.author);
            }
        });
        return Array.from(authorMap.values());
    }, [posts]);

    const getAuthorInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    // Update URL when query changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (query.search) params.set('search', query.search);
        if (query.category) params.set('category', query.category);
        if (query.tag) params.set('tag', query.tag);
        if (currentPage > 1) params.set('page', currentPage.toString());

        const queryString = params.toString();
        router.replace(queryString ? `/search?${queryString}` : '/search', { scroll: false });
    }, [query, currentPage, router]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        setQuery(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        setQuery(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <>
            <Head>
                <title>Search Blogs</title>
                <meta name="description" content="Search and discover blogs" />
            </Head>
            <main className='pt-16 pb-24 md:pt-9 h-full w-full px-0 md:px-12 text-[var(--custom-textColor)]'>
                <div className="middle py-14 flex text-center md:text-start flex-col md:gap-12 gap-4 font-NeuMachina">
                    <h2 className='text-5xl md:text-7xl md:leading-20'>
                        Discover <span className='text-[var(--custom-primary)]'>amazing <br /> blogs.</span>
                    </h2>
                    <p className='text-sm md:text-4xl'>Search for topics that interest you.</p>
                </div>

                {/* Search Input */}
                <div className="mb-8">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto md:mx-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search blogs by title, description..."
                                className="w-full pl-10 pr-4 py-3 bg-[var(--custom-inputColor)] border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--custom-primary)] transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[var(--custom-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Authors Section - Show when there's a search and authors found */}
                {query.search && !isLoading && uniqueAuthors.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-NeuMachina mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Authors
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {uniqueAuthors.map((author) => (
                                <Link
                                    key={author._id}
                                    href={`/user/${author.username || author._id}`}
                                    className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-full hover:border-primary/50 hover:bg-accent transition-all"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={author.avatar} alt={author.name} className="object-cover" />
                                        <AvatarFallback className="text-xs">
                                            {getAuthorInitials(author.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{author.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bottom w-full">
                    {/* Mobile Slider */}
                    <h3 className='md:text-2xl text-center md:text-start w-full font-NeuMachina mb-8 flex items-center justify-center md:justify-start gap-4'>
                        {query.search ? `Results for "${query.search}"` : 'Latest blogs'} <ArrowDown />
                    </h3>

                    <div className="block sm:hidden">
                        <Swiper
                            className="courses w-full"
                            slidesPerView={1}
                            spaceBetween={1}
                            pagination={{ clickable: true }}
                        >
                            {isLoading
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
                                                No blogs found. Try a different search term.
                                            </div>
                                        </SwiperSlide>
                                    )
                            }
                        </Swiper>
                    </div>

                    {/* Grid for larger devices */}
                    <div className="hidden sm:grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {isLoading
                            ? Array.from({ length: skeletonCount }).map((_, idx) => (
                                <BlogCardSkeleton key={idx} />
                            ))
                            : posts.length > 0
                                ? posts.map((post) => (
                                    <BlogCard key={post._id} post={post} />
                                ))
                                : (
                                    <div className="col-span-full text-center py-12 text-muted-foreground">
                                        No blogs found. Try a different search term.
                                    </div>
                                )
                        }
                    </div>

                    {/* Pagination */}
                    {!isLoading && posts.length > 0 && (
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

                            {/* Page info - always show */}
                            <p className="text-center text-sm text-muted-foreground mt-4">
                                {totalPages > 1
                                    ? `Page ${currentPage} of ${totalPages} • ${pagination?.total || 0} total posts`
                                    : `Showing ${posts.length} of ${pagination?.total || posts.length} posts`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

export default Page;
