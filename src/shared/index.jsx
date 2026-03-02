/**
 * shared/index.jsx
 *
 * FIX: Removed the `EIdProfile` re-export.
 *
 * The previous version exported `EIdProfile` from `features/dashboard/components/eid/EIdProfile`.
 * This is a cross-concern violation: `shared/` should only contain truly generic,
 * reusable components. Feature-specific components (like EIdProfile) belong in
 * their feature module and should be imported directly from there.
 *
 * Importing a feature component through `shared/` also creates a fragile
 * dependency chain: any refactor of the EId feature path would silently break
 * every consumer that imported via this barrel.
 *
 * If EIdProfile needs to be shared across multiple features in the future,
 * it should be extracted into a proper shared component with its own props API.
 *
 * Migration: Replace `import { EIdProfile } from '../shared'` with:
 *   import EIdProfile from '../features/dashboard/components/eid/EIdProfile';
 */
export { default as Background }     from './Background';
export { default as AuthLayout }     from './AuthLayout';
export { default as ContentCard }    from './ContentCard';
export { default as Logo }           from './Logo';
export { default as ScrollToTop }    from './ScrollToTop';
export { default as SortFilter }     from './SortFilter';
export { default as OrderFilter }    from './OrderFilter';
export { default as StatusFilter }   from './StatusFilter';
export { default as Pagination }     from './Pagination';
export { default as SearchBox }      from './SearchBox';
export { default as ArchiveModal }   from './ArchiveModal';
export { default as DeleteModal }    from './DeleteModal';
export { default as DeactiveModal }  from './DeactiveModal';
export { default as ActionDropdown } from './ActionDropdown';
export { default as FormSelect }     from './FormSelect';