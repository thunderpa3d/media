const supabaseUrl = 'https://ciqpdavzvndopznczevf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpcXBkYXZ6dm5kb3B6bmN6ZXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjY1NTEsImV4cCI6MjA1MjU0MjU1MX0.RxLSUcAzgt8G4QprXc-abNW-kecXh17Q6k-xUbaMo_g';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);


// تسجيل الدخول باستخدام Supabase
document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const { user, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        alert("تم تسجيل الدخول بنجاح");
        window.location.href = "center.html"; // التوجيه إلى الصفحة الرئيسية
    } catch (error) {
        console.error("Error logging in:", error);
        alert("فشل تسجيل الدخول: " + error.message);
    }
});

// رفع الملفات إلى GitHub
async function uploadFileToGitHub(file) {
    const GITHUB_USERNAME = "thunderpa3d"; // استبدل باسم المستخدم
    const REPO_NAME = "media"; // استبدل باسم المستودع
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/`;
   // استخدام متغير البيئة بدلاً من تضمين الرمز مباشرة
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;


    const base64File = await fileToBase64(file);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `uploads/${fileName}`;

    const payload = {
        message: `Add ${fileName}`,
        content: base64File,
    };

    const response = await fetch(`${GITHUB_API_URL}${filePath}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`GitHub upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content.download_url; // هذا هو رابط الصورة أو الفيديو
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// نشر التجارة إلى Supabase
document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById("postForm");
    if (postForm) {
        postForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const formData = new FormData(this);
            const content = formData.get("content");
            const price = formData.get("price");
            const location = formData.get("location");
            const file = formData.get("media");

            try {
                const mediaUrl = await uploadFileToGitHub(file);

                // نشر البيانات في Supabase
                const { data, error } = await supabase
                    .from('posts')
                    .insert([ 
                        { content, price, location, media_url: mediaUrl, created_at: new Date() }
                    ]);

                if (error) throw error;

                alert("تم نشر التجارة بنجاح");
                window.location.href = "center.html"; // Redirect to the page showing the posts
            } catch (error) {
                console.error("Error:", error);
                alert("حدث خطأ أثناء العملية");
            }
        });
    }
});

// جلب المنشورات من Supabase وعرضها
async function fetchPosts() {
    const postsContainer = document.getElementById("posts-container");
    postsContainer.innerHTML = "<p>جاري تحميل البيانات...</p>";

    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        postsContainer.innerHTML = "";

        data.forEach(post => {
            const postCard = document.createElement("div");
            postCard.className = "post-card";

            let mediaContent = "";
            if (post.media_url) {
                if (/\.(jpg|jpeg|png|gif)$/i.test(post.media_url)) {
                    mediaContent = `<img src="${post.media_url}" alt="Media">`;
                } else if (/\.(mp4|webm|ogg)$/i.test(post.media_url)) {
                    mediaContent = `<video controls>
                                        <source src="${post.media_url}" type="video/mp4">
                                    </video>`;
                }
            }

            postCard.innerHTML = `
                <h5>${post.location}</h5>
                <p>${post.content}</p>
                ${mediaContent}
                <div class="post-footer">
                    <span>السعر: ${post.price}</span>
                    <span>${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
            `;
            postsContainer.appendChild(postCard);
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        postsContainer.innerHTML = "<p>حدث خطأ أثناء تحميل البيانات</p>";
    }
}

fetchPosts();
