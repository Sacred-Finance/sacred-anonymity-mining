import React, { useState, FunctionComponent, useContext } from 'react'

type PostListContextType = {
  isEditForm: boolean
  setIsFormOpen: (isOpen: boolean) => void
  isFormOpen: boolean
  showFilter: boolean
  showDescription: boolean
  isPostEditable: boolean
  isPostEditing: boolean
  setIsPostEditing: (isEditing: boolean) => void
  isCommentForm?: boolean
}

// Create the context with default values
export const PostListContext = React.createContext<PostListContextType | undefined>(undefined)

// Define a type for the props of PostListProvider
type PostListProviderProps = {
  isEditForm: boolean
  isCommentForm?: boolean
  showFilter: boolean
  showDescription: boolean
  isPostEditable: boolean
  children: React.ReactNode
}

export const PostListProvider: FunctionComponent<PostListProviderProps> = ({
  children,
  isEditForm,
  showFilter,
  showDescription,
  isPostEditable,
  isCommentForm,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPostEditing, setIsPostEditing] = useState(false)

  const contextValue: PostListContextType = {
    isEditForm,
    setIsFormOpen,
    isFormOpen,
    showFilter,
    showDescription,
    isPostEditable,
    isPostEditing,
    setIsPostEditing,
    isCommentForm,
  }

  return <PostListContext.Provider value={contextValue}>{children}</PostListContext.Provider>
}

export function usePostListContext() {
  const context = useContext(PostListContext)
  if (!context) {
    throw new Error('usePostListContext must be used within a PostListProvider')
  }
  return context
}
