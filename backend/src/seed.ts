import mongoose from "mongoose";
import { env } from "./config/env.js";
import UserModel from "./model/user.model.js";
import CategoryModel from "./model/category.model.js";
import PostModel from "./model/post.model.js";
import CommentModel from "./model/comment.model.js";
import { Role, UserStatus } from "./constants/user.constants.js";
import slugifyLib from "slugify";

const slugify = slugifyLib.default || slugifyLib;

// Mock Data
const users = [
    {
        name: "Admin User",
        email: "admin@blogapp.com",
        password: "Admin@123456",
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        username: "admin",
        bio: "Platform administrator and content moderator.",
    },
    {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "Password@123",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        username: "johndoe",
        bio: "Full-stack developer and tech enthusiast. Love writing about JavaScript, React, and Node.js.",
    },
    {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "Password@123",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        username: "janesmith",
        bio: "Frontend developer passionate about UI/UX design and web accessibility.",
    },
    {
        name: "Bob Wilson",
        email: "bob.wilson@example.com",
        password: "Password@123",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        username: "bobwilson",
        bio: "Backend engineer specializing in microservices and cloud architecture.",
    },
];

const categories = [
    {
        name: "Technology",
        description: "Latest tech news, tutorials, and insights",
        color: "#3B82F6",
        icon: "laptop",
    },
    {
        name: "Programming",
        description: "Coding tutorials, best practices, and tips",
        color: "#10B981",
        icon: "code",
    },
    {
        name: "Web Development",
        description: "Frontend, backend, and full-stack web development",
        color: "#8B5CF6",
        icon: "globe",
    },
    {
        name: "DevOps",
        description: "CI/CD, cloud infrastructure, and automation",
        color: "#F59E0B",
        icon: "server",
    },
    {
        name: "AI & Machine Learning",
        description: "Artificial intelligence and ML tutorials",
        color: "#EF4444",
        icon: "brain",
    },
    {
        name: "Career",
        description: "Career advice, interviews, and professional growth",
        color: "#EC4899",
        icon: "briefcase",
    },
    {
        name: "Lifestyle",
        description: "Work-life balance, productivity, and developer life",
        color: "#14B8A6",
        icon: "heart",
    },
];

const posts = [
    {
        title: "Getting Started with Node.js and Express in 2024",
        description:
            "A comprehensive guide to building modern REST APIs with Node.js, Express, and TypeScript. Learn best practices and patterns.",
        content: `Node.js has revolutionized backend development, and when combined with Express.js, it becomes a powerful tool for building scalable web applications.

## Why Node.js?

Node.js offers several advantages:
- **Non-blocking I/O**: Perfect for handling multiple concurrent connections
- **JavaScript everywhere**: Use the same language on frontend and backend
- **Rich ecosystem**: npm has millions of packages to accelerate development
- **Great for real-time apps**: WebSockets and event-driven architecture

## Setting Up Your Project

First, initialize your project:

\`\`\`bash
mkdir my-api
cd my-api
npm init -y
npm install express typescript @types/express @types/node ts-node nodemon
\`\`\`

## Creating Your First Route

\`\`\`typescript
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Best Practices

1. **Use TypeScript**: Catch errors at compile time
2. **Implement proper error handling**: Create custom error classes
3. **Use environment variables**: Never hardcode secrets
4. **Add request validation**: Use Zod or Joi
5. **Structure your code**: Follow MVC or clean architecture

## Conclusion

Node.js and Express provide a solid foundation for building modern APIs. Combined with TypeScript, you get type safety and better developer experience.`,
        tags: ["nodejs", "express", "typescript", "backend", "api"],
        categorySlug: "web-development",
        authorIndex: 1,
        isPublished: true,
    },
    {
        title: "Mastering React Hooks: A Complete Guide",
        description:
            "Deep dive into React Hooks including useState, useEffect, useContext, useReducer, and custom hooks with practical examples.",
        content: `React Hooks have transformed how we write React components. Let's explore the most important hooks and how to use them effectively.

## useState - Managing Local State

\`\`\`jsx
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', email: '' });
\`\`\`

**Tips:**
- Use multiple useState for unrelated state
- Use objects for related state
- Remember state updates are async

## useEffect - Side Effects

\`\`\`jsx
useEffect(() => {
  // Runs on mount and when dependencies change
  const fetchData = async () => {
    const data = await api.getUser(userId);
    setUser(data);
  };
  fetchData();
  
  return () => {
    // Cleanup function
  };
}, [userId]);
\`\`\`

## Custom Hooks

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}
\`\`\`

## Best Practices

1. Follow the Rules of Hooks
2. Keep hooks at the top level
3. Extract complex logic into custom hooks
4. Use the ESLint plugin for hooks

Hooks make React code more readable and reusable. Master them to become a better React developer!`,
        tags: ["react", "hooks", "javascript", "frontend", "web-development"],
        categorySlug: "programming",
        authorIndex: 2,
        isPublished: true,
    },
    {
        title: "MongoDB vs PostgreSQL: Choosing the Right Database",
        description:
            "An in-depth comparison of MongoDB and PostgreSQL to help you choose the right database for your next project.",
        content: `Choosing between MongoDB and PostgreSQL is a common dilemma. Let's compare them across various dimensions.

## Data Model

### MongoDB (Document-based)
\`\`\`json
{
  "_id": "ObjectId",
  "name": "John",
  "orders": [
    { "item": "Book", "price": 29.99 },
    { "item": "Pen", "price": 4.99 }
  ]
}
\`\`\`

### PostgreSQL (Relational)
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  item VARCHAR(100),
  price DECIMAL
);
\`\`\`

## When to Choose MongoDB

- Flexible schema requirements
- Rapid prototyping
- Hierarchical data storage
- Horizontal scaling needs
- Real-time analytics

## When to Choose PostgreSQL

- Complex queries and joins
- ACID compliance is critical
- Strong data integrity needed
- Existing SQL expertise
- Advanced features (full-text search, GIS)

## Conclusion

There's no one-size-fits-all answer. Choose based on:
- Your data structure
- Query patterns
- Scaling requirements
- Team expertise

Both are excellent databases - pick the one that fits your use case!`,
        tags: ["mongodb", "postgresql", "database", "nosql", "sql", "backend"],
        categorySlug: "technology",
        authorIndex: 3,
        isPublished: true,
    },
    {
        title: "Docker for Developers: From Zero to Hero",
        description:
            "Learn Docker from scratch. Understand containers, images, volumes, networking, and Docker Compose with hands-on examples.",
        content: `Docker has become essential for modern software development. Let's learn it step by step.

## What is Docker?

Docker allows you to package applications with all dependencies into standardized units called containers.

## Key Concepts

- **Image**: Blueprint for containers (like a class)
- **Container**: Running instance of an image (like an object)
- **Dockerfile**: Instructions to build an image
- **Volume**: Persistent data storage
- **Network**: Communication between containers

## Your First Dockerfile

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "dist/server.js"]
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/mydb
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:alpine

volumes:
  mongo_data:
\`\`\`

## Best Practices

1. Use multi-stage builds
2. Don't run as root
3. Use .dockerignore
4. Keep images small
5. One process per container

Docker simplifies development, testing, and deployment. Start using it today!`,
        tags: ["docker", "devops", "containers", "deployment", "kubernetes"],
        categorySlug: "devops",
        authorIndex: 1,
        isPublished: true,
    },
    {
        title: "Introduction to Machine Learning with Python",
        description:
            "Start your ML journey with Python. Learn about supervised learning, classification, regression, and build your first model.",
        content: `Machine Learning is transforming industries. Let's get started with the fundamentals.

## What is Machine Learning?

ML is a subset of AI where computers learn from data without being explicitly programmed.

## Types of ML

1. **Supervised Learning**: Learn from labeled data
2. **Unsupervised Learning**: Find patterns in unlabeled data
3. **Reinforcement Learning**: Learn through trial and error

## Your First ML Model

\`\`\`python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load data
df = pd.read_csv('data.csv')

# Prepare features and target
X = df.drop('target', axis=1)
y = df['target']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)

# Evaluate
accuracy = accuracy_score(y_test, predictions)
print(f'Accuracy: {accuracy:.2%}')
\`\`\`

## Tips for Beginners

1. Start with simple algorithms
2. Understand your data first
3. Feature engineering is crucial
4. Don't skip validation
5. Learn from Kaggle competitions

ML is a vast field - start small and keep learning!`,
        tags: ["machine-learning", "python", "ai", "data-science", "scikit-learn"],
        categorySlug: "ai-machine-learning",
        authorIndex: 2,
        isPublished: true,
    },
    {
        title: "How I Landed My First Developer Job in 6 Months",
        description:
            "My personal journey from complete beginner to employed software developer. Tips, resources, and lessons learned.",
        content: `Six months ago, I wrote my first line of code. Today, I'm a professional software developer. Here's my story.

## Month 1-2: The Fundamentals

I started with:
- HTML & CSS (2 weeks)
- JavaScript basics (4 weeks)
- Built 5 small projects

**Key resources:**
- freeCodeCamp
- The Odin Project
- JavaScript.info

## Month 3-4: Going Deeper

- React.js (3 weeks)
- Node.js & Express (2 weeks)
- MongoDB (1 week)
- Built 3 full-stack projects

## Month 5: Job Preparation

- Polished my portfolio
- Created GitHub profile README
- Practiced DSA (2 hours daily)
- Mock interviews with friends

## Month 6: Job Hunt

- Applied to 150+ jobs
- Got 12 interview calls
- 5 technical rounds
- 2 offers!

## What Worked for Me

1. **Consistency**: Coded 4+ hours daily
2. **Projects over tutorials**: Build, don't just watch
3. **Networking**: Twitter, LinkedIn, Discord communities
4. **Open source**: Contributed to 3 projects
5. **Teaching**: Blogged about what I learned

## Tips for You

1. Don't compare your journey to others
2. Build in public
3. Embrace rejection
4. Keep learning after getting hired

If I can do it, so can you. Start today!`,
        tags: ["career", "job-hunting", "beginner", "self-taught", "tips"],
        categorySlug: "career",
        authorIndex: 3,
        isPublished: true,
    },
    {
        title: "Work-Life Balance as a Developer: My Approach",
        description:
            "How I maintain productivity while avoiding burnout. Tips for staying healthy and happy as a software developer.",
        content: `After 5 years in tech, I've learned that burnout is real. Here's how I stay balanced.

## My Daily Routine

**Morning (6 AM - 9 AM)**
- Wake up without alarm (8 hours sleep)
- 30 min exercise
- Healthy breakfast
- No phone for first hour

**Work (9 AM - 6 PM)**
- Deep work: 9-12 (no meetings)
- Lunch break: 12-1 (away from desk)
- Meetings/collaboration: 1-4
- Wrap up/planning: 4-6

**Evening (6 PM onwards)**
- No work emails/Slack
- Hobbies (guitar, cooking, reading)
- Quality time with family
- Wind down by 10 PM

## Strategies That Work

### 1. Strict Boundaries
- Work stays at work
- No Slack on phone
- Calendar blocking for personal time

### 2. Regular Exercise
- Gym 4x per week
- Walking meetings
- Standing desk

### 3. Mental Health
- Therapy when needed
- Meditation (10 min daily)
- Journaling

## Signs of Burnout

Watch for these:
- Dreading work every day
- Constant fatigue
- Cynicism about projects
- Decreased productivity
- Physical symptoms (headaches, insomnia)

## If You're Burning Out

1. Talk to someone (manager, therapist)
2. Take time off (use your PTO!)
3. Reduce commitments
4. Re-evaluate priorities
5. Consider a change if needed

Your health > Your job. Always.`,
        tags: ["work-life-balance", "burnout", "mental-health", "productivity", "career"],
        categorySlug: "lifestyle",
        authorIndex: 1,
        isPublished: true,
    },
    {
        title: "TypeScript Best Practices for 2024",
        description:
            "Level up your TypeScript skills with these modern best practices, tips, and patterns used by professional developers.",
        content: `TypeScript has evolved significantly. Here are the best practices for 2024.

## 1. Use Strict Mode

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
\`\`\`

## 2. Prefer Interfaces for Objects

\`\`\`typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions, intersections, mapped types
type Status = 'pending' | 'active' | 'inactive';
type UserWithStatus = User & { status: Status };
\`\`\`

## 3. Use Const Assertions

\`\`\`typescript
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'user' | 'guest'

const config = {
  api: 'https://api.example.com',
  timeout: 5000
} as const;
\`\`\`

## 4. Discriminated Unions

\`\`\`typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data);
  } else {
    console.error(result.error);
  }
}
\`\`\`

## 5. Utility Types

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Omit<User, 'password'>;
type CreateUser = Pick<User, 'name' | 'email' | 'password'>;
type PartialUser = Partial<User>;
\`\`\`

TypeScript makes JavaScript development safer and more enjoyable. Embrace it fully!`,
        tags: ["typescript", "javascript", "best-practices", "programming", "web-development"],
        categorySlug: "programming",
        authorIndex: 2,
        isPublished: true,
    },
];

const comments = [
    {
        postIndex: 0,
        authorIndex: 2,
        content:
            "Great article! This helped me understand Express better. I've been struggling with middleware for a while.",
    },
    {
        postIndex: 0,
        authorIndex: 3,
        content:
            "Thanks for the detailed explanation. Could you also cover error handling patterns in Express?",
    },
    {
        postIndex: 1,
        authorIndex: 1,
        content: "useEffect dependencies have always confused me. This cleared things up!",
    },
    {
        postIndex: 1,
        authorIndex: 3,
        content:
            "Custom hooks are a game changer. I started extracting logic into hooks and my components are so much cleaner now.",
    },
    {
        postIndex: 2,
        authorIndex: 1,
        content:
            "We migrated from PostgreSQL to MongoDB last year and honestly regret it. For our use case with complex queries, PostgreSQL was much better.",
    },
    {
        postIndex: 3,
        authorIndex: 2,
        content:
            "Docker Compose changed my local development experience completely. No more 'works on my machine'!",
    },
    {
        postIndex: 4,
        authorIndex: 3,
        content: "Starting my ML journey next month. Bookmarking this!",
    },
    {
        postIndex: 5,
        authorIndex: 1,
        content:
            "This is so inspiring! I'm on month 2 of my coding journey. Thanks for sharing your experience.",
    },
    {
        postIndex: 6,
        authorIndex: 2,
        content:
            "Needed this today. I've been working 12 hour days for the past month and feeling it.",
    },
    {
        postIndex: 7,
        authorIndex: 3,
        content: "The discriminated unions section is gold! Been looking for a clear explanation.",
    },
];

async function seed() {
    try {
        console.log("🌱 Starting database seeding...\n");

        // Connect to MongoDB
        await mongoose.connect(env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        // Clear existing data
        console.log("🗑️  Clearing existing data...");
        await Promise.all([
            UserModel.deleteMany({}),
            CategoryModel.deleteMany({}),
            PostModel.deleteMany({}),
            CommentModel.deleteMany({}),
        ]);
        console.log("✅ Existing data cleared\n");

        // Seed Users (password will be auto-hashed, username auto-generated by model)
        console.log("👤 Seeding users...");
        const createdUsers = [];
        for (const userData of users) {
            const user = await UserModel.create({
                ...userData,
                refreshTokens: [],
            });
            createdUsers.push(user);
            console.log(`   ✓ Created user: ${user.email} (@${user.username})`);
        }
        console.log(`✅ Created ${createdUsers.length} users\n`);

        // Seed Categories
        console.log("📁 Seeding categories...");
        const createdCategories: Record<string, mongoose.Types.ObjectId> = {};
        for (const categoryData of categories) {
            const slug = slugify(categoryData.name, { lower: true, strict: true });
            const category = await CategoryModel.create({
                ...categoryData,
                slug,
                postCount: 0,
                isActive: true,
            });
            createdCategories[slug] = category._id;
            console.log(`   ✓ Created category: ${category.name}`);
        }
        console.log(`✅ Created ${Object.keys(createdCategories).length} categories\n`);

        // Seed Posts
        console.log("📝 Seeding posts...");
        const createdPosts = [];
        for (const postData of posts) {
            const slug = slugify(postData.title, { lower: true, strict: true });
            const categoryId = createdCategories[postData.categorySlug];
            const authorId = createdUsers[postData.authorIndex]._id;

            const post = await PostModel.create({
                author: authorId,
                category: categoryId,
                title: postData.title,
                slug,
                description: postData.description,
                content: postData.content,
                tags: postData.tags,
                isPublished: postData.isPublished,
                likes: [],
                likesCount: 0,
                commentsCount: 0,
            });
            createdPosts.push(post);
            console.log(`   ✓ Created post: ${post.title.substring(0, 40)}...`);
        }
        console.log(`✅ Created ${createdPosts.length} posts\n`);

        // Update category post counts
        console.log("🔢 Updating category post counts...");
        for (const [slug, categoryId] of Object.entries(createdCategories)) {
            const count = await PostModel.countDocuments({
                category: categoryId,
                isPublished: true,
            });
            await CategoryModel.findByIdAndUpdate(categoryId, { postCount: count });
            console.log(`   ✓ ${slug}: ${count} posts`);
        }
        console.log("✅ Category counts updated\n");

        // Seed Comments
        console.log("💬 Seeding comments...");
        for (const commentData of comments) {
            const post = createdPosts[commentData.postIndex];
            const author = createdUsers[commentData.authorIndex];

            await CommentModel.create({
                post: post._id,
                author: author._id,
                content: commentData.content,
                parent: null,
                replies: [],
                depth: 0,
                isDeleted: false,
            });

            // Update post comment count
            await PostModel.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
        }
        console.log(`✅ Created ${comments.length} comments\n`);

        console.log("═══════════════════════════════════════════════════════");
        console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
        console.log("═══════════════════════════════════════════════════════\n");
        console.log("📊 Summary:");
        console.log(`   • Users: ${createdUsers.length}`);
        console.log(`   • Categories: ${Object.keys(createdCategories).length}`);
        console.log(`   • Posts: ${createdPosts.length}`);
        console.log(`   • Comments: ${comments.length}`);
        console.log("\n📧 Test Accounts:");
        console.log("   Admin:  admin@blogapp.com / Admin@123456");
        console.log("   User 1: john.doe@example.com / Password@123");
        console.log("   User 2: jane.smith@example.com / Password@123");
        console.log("   User 3: bob.wilson@example.com / Password@123\n");

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seed();
