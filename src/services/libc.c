typedef unsigned long size_t;
typedef signed long ssize_t;

#define NULL ((void*)0)
#define PAGE_SIZE 65536
#define ALIGNMENT 8

static unsigned char heap[PAGE_SIZE * 32];
static size_t heap_end = 0;

typedef struct block_meta {
    size_t size;
    struct block_meta* next;
    int free;
} block_meta_t;

static block_meta_t* head = NULL;

static block_meta_t* find_free_block(block_meta_t** last, size_t size) {
    block_meta_t* current = head;
    while (current && !(current->free && current->size >= size)) {
        *last = current;
        current = current->next;
    }
    return current;
}

static block_meta_t* request_space(block_meta_t* last, size_t size) {
    block_meta_t* block;
    block = (block_meta_t*)(heap + heap_end);
    
    size_t total_size = size + sizeof(block_meta_t);
    if (heap_end + total_size > sizeof(heap)) {
        return NULL;
    }
    
    heap_end += total_size;
    
    block->size = size;
    block->next = NULL;
    block->free = 0;
    
    if (last) {
        last->next = block;
    }
    
    return block;
}

void* malloc(size_t size) {
    if (size <= 0) return NULL;
    
    size = (size + ALIGNMENT - 1) & ~(ALIGNMENT - 1);
    
    block_meta_t* block;
    
    if (head == NULL) {
        block = request_space(NULL, size);
        if (block == NULL) return NULL;
        head = block;
    } else {
        block_meta_t* last = head;
        block = find_free_block(&last, size);
        if (!block) {
            block = request_space(last, size);
            if (block == NULL) return NULL;
        } else {
            block->free = 0;
        }
    }
    
    return (block + 1);
}

void* calloc(size_t nmemb, size_t size) {
    size_t total = nmemb * size;
    void* ptr = malloc(total);
    if (ptr) {
        unsigned char* p = (unsigned char*)ptr;
        for (size_t i = 0; i < total; i++) {
            p[i] = 0;
        }
    }
    return ptr;
}

void free(void* ptr) {
    if (!ptr) return;
    
    block_meta_t* block = ((block_meta_t*)ptr) - 1;
    block->free = 1;
}

void* memset(void* s, int c, size_t n) {
    unsigned char* p = (unsigned char*)s;
    while (n--) *p++ = (unsigned char)c;
    return s;
}

void* memcpy(void* dest, const void* src, size_t n) {
    unsigned char* d = (unsigned char*)dest;
    const unsigned char* s = (const unsigned char*)src;
    while (n--) *d++ = *s++;
    return dest;
}

int memcmp(const void* s1, const void* s2, size_t n) {
    const unsigned char* p1 = (const unsigned char*)s1;
    const unsigned char* p2 = (const unsigned char*)s2;
    while (n--) {
        if (*p1 != *p2) return *p1 - *p2;
        p1++;
        p2++;
    }
    return 0;
}
