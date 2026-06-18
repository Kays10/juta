# LH Open Minded Institute - Test Checklist

## ✅ Registration Form - Complete Test Suite

### 1. Environment Setup (Vercel)
- [ ] NEXT_PUBLIC_SUPABASE_URL configured ✓
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configured ✓
- [ ] SUPABASE_SERVICE_ROLE_KEY configured ✓
- [ ] Domain `programs.lhopenminded.co.za` verified ✓

### 2. Supabase Database & Storage Setup
- [ ] **Database Tables Created:**
  - `learners` table (with NOT NULL start_date and end_date) ✓
  - `contact_information` table ✓
  - `previous_employment` table ✓
  - `documents` table ✓

- [ ] **Row Level Security (RLS) Policies:**
  - [ ] `learners` - INSERT policy for anon (for registration)
  - [ ] `learners` - SELECT policy for authenticated users (for management)
  - [ ] `learners` - UPDATE policy for authenticated users (for status updates)
  - [ ] `contact_information` - INSERT policy for anon
  - [ ] `contact_information` - SELECT policy for authenticated users
  - [ ] `previous_employment` - INSERT policy for anon
  - [ ] `previous_employment` - SELECT policy for authenticated users
  - [ ] `documents` - INSERT policy for anon
  - [ ] `documents` - SELECT policy for authenticated users
  - [ ] `documents` - UPDATE policy for authenticated users

- [ ] **Storage Bucket:**
  - [ ] Bucket `learner-documents` created
  - [ ] Storage RLS policies allow uploads from anon (for registration)
  - [ ] Storage RLS policies allow reads from authenticated users (for management)

### 3. Frontend Code - Registration Flow Test

#### IT Stream Registration Test
- [ ] Select "IT" stream
- [ ] Fill all required fields:
  - [ ] First name
  - [ ] Surname
  - [ ] ID number
  - [ ] Date of birth
  - [ ] Gender
  - [ ] Next of kin name
  - [ ] Next of kin age
  - [ ] Next of kin contact number
  - [ ] Contact number
  - [ ] Personal email
  - [ ] Home address
  - [ ] Street address
  - [ ] Area
  - [ ] Province
  - [ ] Postal code
  - [ ] Qualification ID
  - [ ] Learnership registration number
  - [ ] Course name
  - [ ] Start date
  - [ ] End date
- [ ] Upload documents (PDF only):
  - [ ] Matric Certificate
  - [ ] ID Copy
  - [ ] Proof of Bank Account
  - [ ] Tertiary Qualification Document (optional)
  - [ ] Proof of Address
- [ ] Submit form
- [ ] **Expected Result:** Redirect to `/register/success`

#### MATHS Stream Registration Test
- [ ] Select "MATHS" stream
- [ ] Fill all required fields (same as IT except:)
  - [ ] Motivational Letter instead of Proof of Bank Account
  - [ ] NO Tertiary Qualification Document
  - [ ] NO Employment status field
  - [ ] NO Previous employment section
  - [ ] NO Qualification ID, Learnership registration number, Course name
- [ ] Still require: Start date, End date ✓ (Fixed!)
- [ ] Upload documents:
  - [ ] Matric Statement
  - [ ] ID Copy
  - [ ] Motivational Letter
  - [ ] Proof of Address
- [ ] Submit form
- [ ] **Expected Result:** Redirect to `/register/success`

### 4. File Upload Test
- [ ] Test with small files (< 5MB) ✓
- [ ] Test with medium files (5-15MB) ✓
- [ ] Test with large files (15-25MB) ✓
- [ ] **Verify:** 413 error is RESOLVED (files upload directly to Supabase)
- [ ] **Verify:** Documents appear in Supabase Storage bucket
- [ ] **Verify:** Document records created in `documents` table

### 5. Management Portal Test

#### Login Test
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] **Expected Result:** Redirect to `/management`

#### Learner List Test
- [ ] View list of all registered learners
- [ ] Filter by Stream (IT/MATHS)
- [ ] Filter by Status (New/In Review/Accepted/Declined)
- [ ] Search by Name or ID number
- [ ] **Expected Result:** Filters work correctly

#### Learner Detail Test
- [ ] Click "View details" on a learner
- [ ] **Verify:** Personal information displays correctly
- [ ] **Verify:** Contact information displays correctly
- [ ] **Verify:** Documents list displays correctly
- [ ] **Verify:** Document download links work

#### Status Update Test
- [ ] Click "Mark in review"
- [ ] **Verify:** Status changes to "In Review"
- [ ] Click "Mark accepted"
- [ ] **Verify:** Status changes to "Accepted"
- [ ] Click "Mark declined"
- [ ] **Verify:** Status changes to "Declined"

#### Sign Out Test
- [ ] Click "Sign out" button
- [ ] **Expected Result:** Redirect to `/login`

### 6. Error Handling Test

#### Validation Errors
- [ ] Submit form with missing required fields
- [ ] **Expected Result:** Error message displayed

#### End Date Before Start Date
- [ ] Set end date earlier than start date
- [ ] **Expected Result:** Error "End date cannot be before start date"

#### File Size Exceeded
- [ ] Upload files totaling > 25MB
- [ ] **Expected Result:** Error "Your documents are too large..."

#### Supabase Connection Error
- [ ] Test with invalid/missing environment variables
- [ ] **Expected Result:** Clear error message displayed

## 🚨 Critical Issues to Check in Supabase Dashboard

### 1. RLS Policies (Most Likely Cause of Issues)
Go to Supabase Dashboard → Authentication → Policies and verify:

**For `learners` table:**
```sql
-- Allow anyone to INSERT (for registration)
CREATE POLICY "Allow anon insert" ON learners
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to SELECT
CREATE POLICY "Allow auth select" ON learners
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to UPDATE
CREATE POLICY "Allow auth update" ON learners
  FOR UPDATE TO authenticated
  USING (true);
```

**For `contact_information` table:**
```sql
CREATE POLICY "Allow anon insert" ON contact_information
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow auth select" ON contact_information
  FOR SELECT TO authenticated
  USING (true);
```

**For `documents` table:**
```sql
CREATE POLICY "Allow anon insert" ON documents
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow auth select" ON documents
  FOR SELECT TO authenticated
  USING (true);
```

### 2. Storage Bucket Policies
Go to Supabase Dashboard → Storage → Buckets → `learner-documents` → Policies:

```sql
-- Allow anyone to upload files (for registration)
CREATE POLICY "Allow anon uploads" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'learner-documents');

-- Allow authenticated users to view files (for management)
CREATE POLICY "Allow auth select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'learner-documents');
```

## 📝 Common Issues & Solutions

### Issue: "Could not save learner details"
**Solution:** Check RLS policies - anon needs INSERT permission on `learners` table

### Issue: Files upload but don't save to database
**Solution:** Check RLS policies - anon needs INSERT permission on `documents` table

### Issue: Management portal shows "No learners found"
**Solution:** Check RLS policies - authenticated users need SELECT permission on `learners` table

### Issue: Cannot download documents
**Solution:** Check Storage policies - authenticated users need SELECT permission on storage bucket

## ✅ Deployment Verification

- [ ] All code committed to GitHub
- [ ] Vercel build successful
- [ ] Vercel deployment live
- [ ] DNS verified on Vercel dashboard (green checkmark)
- [ ] Custom domain `programs.lhopenminded.co.za` working

## 🎯 Success Criteria

1. ✅ Registration form accepts both IT and MATHS streams
2. ✅ Date fields visible for all streams (fixed!)
3. ✅ Files upload directly to Supabase (no 413 error!)
4. ✅ Learner data saves to database
5. ✅ Document metadata saved correctly
6. ✅ Management portal accessible with login
7. ✅ Learners list displays correctly
8. ✅ Learner details viewable
9. ✅ Status updates work
10. ✅ Sign out works
