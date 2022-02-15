/* eslint-disable prettier/prettier */
import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { pt } from 'date-fns/locale';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';


import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const formattedPosts = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: pt }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const [posts, setPosts] = useState<Post[]>(formattedPosts);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [CurrentPage, setCurrentPage] = useState(1);

  async function handleNextPage(): Promise<void> {
    if (CurrentPage !== 1 && nextPage == null) {
      return;
    }

    const postResults = await fetch(nextPage).then(response => response.json());
    setNextPage(postResults.next_page);
    setCurrentPage(postResults.page);

    const newsPosts = postResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: pt }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })
    setPosts([...posts, ...newsPosts]);
  }

  return (
    <main className={commonStyles.container}>
      <div className={styles.posts}>
        {posts.map(post => {
          return (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              {/* TESTE */}
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <span><FiCalendar /> {post.first_publication_date}</span>
                <span><FiUser /> {post.data.author}</span><br />
              </a>

              {/* <a>
                <h1>{RichText.asText(post.data.title)}</h1>
                <p>{RichText.asText(post.data.subtitle)}</p>
                <span><FiCalendar /> {post.first_publication_date}</span>
                <span><FiUser /> {RichText.asText(post.data.author)}</span><br />
              </a> */}
            </Link>
          )
        })}
      </div>
      {nextPage === null ? '' : <button type="button" onClick={handleNextPage}>Carregar mais posts</button>}
    </main>

  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 2
  })

  const posts = postsResponse.results.map<Post>(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts

  }

  return {
    props: {
      postsPagination
    },
  };

};
