"use client";

import { useState, useRef } from "react";
import { useCreatePost, useGetCategories } from "@/hooks/TanStack/mutations";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PenLine, X, ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface CreateBlogDrawerProps {
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

// Predefined popular tags
const popularTags = [
    "nodejs",
    "express",
    "typescript",
    "backend",
    "api",
    "react",
    "nextjs",
    "javascript",
    "python",
    "database",
    "mongodb",
    "postgresql",
    "docker",
    "devops",
    "frontend",
    "css",
    "tailwind",
    "ai",
    "machine-learning",
    "tutorial",
];

export default function CreateBlogDrawer({ trigger, onSuccess }: CreateBlogDrawerProps) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const createPostMutation = useCreatePost();
    const { data: categoriesData, isLoading: categoriesLoading } = useGetCategories();

    const categories = categoriesData?.data || [];

    // Form state
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form function
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setContent("");
        setCategory("");
        setTags([]);
        setTagInput("");
        setIsPublished(false);
        setImage(null);
        setImagePreview(null);
    };

    // Handle drawer open/close
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetForm();
        }
    };

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove image
    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Add tag
    const addTag = (tag: string) => {
        const normalizedTag = tag.toLowerCase().trim().replace(/^"|"$/g, "");
        if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 10) {
            setTags([...tags, normalizedTag]);
            setTagInput("");
        }
    };

    // Remove tag
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // Handle tag input keydown
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(tagInput);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login to create a post");
            router.push("/signin");
            return;
        }

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!description.trim() || description.trim().length < 10) {
            toast.error("Description must be at least 10 characters");
            return;
        }

        if (!content.trim() || content.trim().length < 50) {
            toast.error("Content must be at least 50 characters");
            return;
        }

        try {
            await createPostMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                content: content.trim(),
                category: category || undefined,
                tags: tags.length > 0 ? tags : undefined,
                isPublished,
                image: image || undefined,
            });

            setOpen(false);
            onSuccess?.();
        } catch {
            // Error is handled by the mutation
        }
    };

    // Default trigger button
    const defaultTrigger = (
        <Button size="lg" className="gap-2">
            <PenLine className="h-4 w-4" />
            Create Blog
        </Button>
    );

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                {trigger || defaultTrigger}
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh] bg-[#0C0C0C]">
                <div className="mx-auto w-full max-w-2xl overflow-y-auto">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-NeuMachina">
                            Create New Blog Post
                        </DrawerTitle>
                        <DrawerDescription>
                            Share your thoughts with the community
                        </DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter your blog title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {title.length}/200
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of your post (min 10 characters)..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                maxLength={500}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span className={description.length < 10 ? "text-destructive" : ""}>
                                    Min 10 characters
                                </span>
                                <span>{description.length}/500</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                placeholder="Write your blog content here (min 50 characters)..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={8}
                                className="min-h-[200px]"
                            />
                            <p className={`text-xs ${content.length < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                                {content.length}/50 min characters
                            </p>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                {cat.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <div className="space-y-3">
                                <Input
                                    id="tags"
                                    placeholder="Add tags (press Enter or comma to add)"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                />

                                {/* Selected Tags */}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                #{tag}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                    onClick={() => removeTag(tag)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Popular Tags */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Popular tags:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {popularTags.slice(0, 10).map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant={tags.includes(tag) ? "default" : "outline"}
                                                className="cursor-pointer text-xs"
                                                onClick={() => {
                                                    if (tags.includes(tag)) {
                                                        removeTag(tag);
                                                    } else {
                                                        addTag(tag);
                                                    }
                                                }}
                                            >
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Cover Image</Label>
                            <div className="space-y-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {imagePreview ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-32 border-dashed flex flex-col gap-2"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-muted-foreground">Click to upload image</span>
                                        <span className="text-xs text-muted-foreground">Max 5MB</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Publish Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="publish">Publish immediately</Label>
                                <p className="text-sm text-muted-foreground">
                                    {isPublished
                                        ? "Your post will be visible to everyone"
                                        : "Save as draft, publish later"}
                                </p>
                            </div>
                            <Switch
                                id="publish"
                                checked={isPublished}
                                onCheckedChange={setIsPublished}
                            />
                        </div>

                        <DrawerFooter className="px-0">
                            <Button
                                type="submit"
                                disabled={createPostMutation.isPending}
                                className="w-full"
                            >
                                {createPostMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PenLine className="h-4 w-4 mr-2" />
                                        {isPublished ? "Publish Post" : "Save as Draft"}
                                    </>
                                )}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
